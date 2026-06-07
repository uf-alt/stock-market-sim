import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StocksService } from '../stocks/stocks.service';

@Injectable()
export class PortfolioService {
  constructor(
    private prisma: PrismaService,
    private stocks: StocksService,
  ) {}

  async getPortfolio(userId: string) {
    const portfolio = await this.prisma.portfolio.findUnique({
      where: { userId },
      include: { holdings: true },
    });
    if (!portfolio) throw new NotFoundException('Portfolio not found');

    // Refresh Finnhub cache for all held tickers in parallel
    await Promise.allSettled(
      portfolio.holdings.map((h) => this.stocks.getOne(h.ticker)),
    );

    const enrichedHoldings = portfolio.holdings.map((h) => {
      let currentPrice = h.averageCost.toNumber();
      try {
        currentPrice = this.stocks.getExecutionPrice(h.ticker);
      } catch { /* ignore unknown tickers */ }

      const shares = h.shares.toNumber();
      const avgCost = h.averageCost.toNumber();
      const totalValue = currentPrice * shares;
      const totalCost = h.totalCostBasis.toNumber();
      const unrealizedGain = totalValue - totalCost;

      return {
        ticker: h.ticker,
        shares,
        avgCost,
        currentPrice,
        totalValue,
        totalCost,
        unrealizedGain,
        unrealizedGainPct: totalCost > 0 ? (unrealizedGain / totalCost) * 100 : 0,
      };
    });

    const totalHoldingsValue = enrichedHoldings.reduce((s, h) => s + h.totalValue, 0);
    const cashBalance = portfolio.cashBalance.toNumber();
    const totalValue = totalHoldingsValue + cashBalance;

    const holdingsWithAlloc = enrichedHoldings.map((h) => ({
      ...h,
      allocation: totalValue > 0 ? (h.totalValue / totalValue) * 100 : 0,
    }));

    return {
      id: portfolio.id,
      cashBalance,
      totalValue,
      realizedGain: portfolio.realizedGain.toNumber(),
      unrealizedGain: holdingsWithAlloc.reduce((s, h) => s + h.unrealizedGain, 0),
      holdings: holdingsWithAlloc,
    };
  }

  async getTransactions(userId: string, page = 1, limit = 20) {
    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where: { userId },
        orderBy: { executedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.transaction.count({ where: { userId } }),
    ]);

    return { data: transactions, page, limit, total };
  }
}
