import { Controller, Get, Post, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { WatchlistService } from './watchlist.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

class AddTickerDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  ticker: string;
}

@Controller('watchlist')
@UseGuards(JwtAuthGuard)
export class WatchlistController {
  constructor(private watchlistService: WatchlistService) {}

  @Get()
  getWatchlist(@Request() req: { user: { id: string } }) {
    return this.watchlistService.getWatchlist(req.user.id);
  }

  @Post()
  addTicker(@Request() req: { user: { id: string } }, @Body() dto: AddTickerDto) {
    return this.watchlistService.addTicker(req.user.id, dto.ticker);
  }

  @Delete(':ticker')
  removeTicker(@Request() req: { user: { id: string } }, @Param('ticker') ticker: string) {
    return this.watchlistService.removeTicker(req.user.id, ticker);
  }
}
