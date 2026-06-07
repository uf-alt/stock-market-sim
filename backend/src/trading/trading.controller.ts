import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { TradingService } from './trading.service';
import { TradeDto } from './dto/trade.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Throttle } from '@nestjs/throttler';

@Controller('trading')
@UseGuards(JwtAuthGuard)
export class TradingController {
  constructor(private tradingService: TradingService) {}

  @Post('trade')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  executeTrade(@Request() req: { user: { id: string } }, @Body() dto: TradeDto) {
    return this.tradingService.executeTrade(req.user.id, dto);
  }
}
