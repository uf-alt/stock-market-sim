import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { StocksService } from './stocks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('stocks')
@UseGuards(JwtAuthGuard)
export class StocksController {
  constructor(private stocksService: StocksService) {}

  @Get()
  getAll(@Query('q') query?: string) {
    if (query) return this.stocksService.search(query);
    return this.stocksService.getAll();
  }

  @Get(':ticker')
  getOne(@Param('ticker') ticker: string) {
    return this.stocksService.getOne(ticker);
  }

  @Get(':ticker/quote')
  async getQuote(@Param('ticker') ticker: string) {
    const stock = await this.stocksService.getOne(ticker);
    return { ...stock, price: this.stocksService.getExecutionPrice(ticker) };
  }
}
