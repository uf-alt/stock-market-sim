import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('portfolio')
@UseGuards(JwtAuthGuard)
export class PortfolioController {
  constructor(private portfolioService: PortfolioService) {}

  @Get()
  getPortfolio(@Request() req: { user: { id: string } }) {
    return this.portfolioService.getPortfolio(req.user.id);
  }

  @Get('transactions')
  getTransactions(
    @Request() req: { user: { id: string } },
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.portfolioService.getTransactions(req.user.id, +page, +limit);
  }
}
