import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WatchlistService {
  constructor(private prisma: PrismaService) {}

  async getWatchlist(userId: string): Promise<string[]> {
    const rows = await this.prisma.watchlist.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      select: { ticker: true },
    });
    return rows.map((r) => r.ticker);
  }

  async addTicker(userId: string, ticker: string): Promise<void> {
    const sym = ticker.toUpperCase();
    try {
      await this.prisma.watchlist.create({ data: { userId, ticker: sym } });
    } catch {
      throw new ConflictException(`${sym} is already in your watchlist`);
    }
  }

  async removeTicker(userId: string, ticker: string): Promise<void> {
    const sym = ticker.toUpperCase();
    const row = await this.prisma.watchlist.findUnique({
      where: { userId_ticker: { userId, ticker: sym } },
    });
    if (!row) throw new NotFoundException(`${sym} not found in watchlist`);
    await this.prisma.watchlist.delete({ where: { id: row.id } });
  }
}
