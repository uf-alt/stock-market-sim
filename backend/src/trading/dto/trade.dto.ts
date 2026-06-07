import { IsString, IsInt, IsIn, Min } from 'class-validator';

export class TradeDto {
  @IsString()
  ticker: string;

  @IsInt()
  @Min(1)
  shares: number;

  @IsIn(['buy', 'sell'])
  type: 'buy' | 'sell';
}
