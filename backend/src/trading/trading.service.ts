import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StocksService } from '../stocks/stocks.service';
import { TradeDto } from './dto/trade.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class TradingService {
  constructor(
    private prisma: PrismaService,
    private stocks: StocksService,
  ) {}

  async executeTrade(userId: string, dto: TradeDto) {
    const stock = await this.stocks.getOne(dto.ticker);
    const price = new Decimal(this.stocks.getExecutionPrice(dto.ticker));
    const shares = new Decimal(dto.shares);
    const total = price.mul(shares);

    return this.prisma.$transaction(async (tx) => {
      const portfolio = await tx.portfolio.findUnique({
        where: { userId },
        include: { holdings: true },
      });
      if (!portfolio) throw new NotFoundException('Portfolio not found');

      if (dto.type === 'buy') {
        if (portfolio.cashBalance.lessThan(total)) {
          throw new BadRequestException('Insufficient balance');
        }

        const existing = portfolio.holdings.find((h) => h.ticker === dto.ticker);

        if (existing) {
          const newShares = existing.shares.add(shares);
          const newCostBasis = existing.totalCostBasis.add(total);
          const newAvgCost = newCostBasis.div(newShares);

          await tx.holding.update({
            where: { id: existing.id },
            data: {
              shares: newShares,
              averageCost: newAvgCost,
              totalCostBasis: newCostBasis,
            },
          });
        } else {
          await tx.holding.create({
            data: {
              portfolioId: portfolio.id,
              ticker: dto.ticker,
              shares,
              averageCost: price,
              totalCostBasis: total,
            },
          });
        }

        await tx.portfolio.update({
          where: { id: portfolio.id },
          data: { cashBalance: portfolio.cashBalance.sub(total) },
        });
      } else {
        const holding = portfolio.holdings.find((h) => h.ticker === dto.ticker);
        if (!holding || holding.shares.lessThan(shares)) {
          throw new BadRequestException('Insufficient shares');
        }

        const realizedGain = price.sub(holding.averageCost).mul(shares);
        const newShares = holding.shares.sub(shares);

        if (newShares.equals(0)) {
          await tx.holding.delete({ where: { id: holding.id } });
        } else {
          const newCostBasis = holding.totalCostBasis.sub(holding.averageCost.mul(shares));
          await tx.holding.update({
            where: { id: holding.id },
            data: { shares: newShares, totalCostBasis: newCostBasis },
          });
        }

        await tx.portfolio.update({
          where: { id: portfolio.id },
          data: {
            cashBalance: portfolio.cashBalance.add(total),
            realizedGain: portfolio.realizedGain.add(realizedGain),
          },
        });
      }

      // Record immutable transaction
      await tx.transaction.create({
        data: {
          userId,
          portfolioId: portfolio.id,
          type: dto.type === 'buy' ? 'BUY' : 'SELL',
          ticker: dto.ticker,
          shares,
          price,
          total,
        },
      });

      return { ticker: dto.ticker, type: dto.type, shares: dto.shares, price: price.toNumber(), total: total.toNumber() };
    });
  }
}
