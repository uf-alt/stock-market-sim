import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { StocksModule } from './stocks/stocks.module';
import { TradingModule } from './trading/trading.module';
import { PortfolioModule } from './portfolio/portfolio.module';
import { WatchlistModule } from './watchlist/watchlist.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env', 'backend/.env'] }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    PrismaModule,
    AuthModule,
    StocksModule,
    TradingModule,
    PortfolioModule,
    WatchlistModule,
  ],
})
export class AppModule {}
