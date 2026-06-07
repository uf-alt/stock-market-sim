import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface StockQuote {
  ticker: string;
  name: string;
  sector: string;
  price: number;
  change: number;
  changePct: number;
  volume: string;
  marketCap: string;
  pe: number | null;
}

const STOCK_REGISTRY: StockQuote[] = [
  { ticker: 'AAPL', name: 'Apple Inc.', sector: 'Technology', price: 213.49, change: 2.14, changePct: 1.01, volume: '48.2M', marketCap: '$3.28T', pe: 33.4 },
  { ticker: 'MSFT', name: 'Microsoft Corp.', sector: 'Technology', price: 425.27, change: 5.82, changePct: 1.39, volume: '21.1M', marketCap: '$3.16T', pe: 36.2 },
  { ticker: 'NVDA', name: 'NVIDIA Corp.', sector: 'Technology', price: 875.39, change: 24.18, changePct: 2.84, volume: '62.4M', marketCap: '$2.15T', pe: 68.1 },
  { ticker: 'AMZN', name: 'Amazon.com Inc.', sector: 'Consumer Discretionary', price: 187.44, change: -1.23, changePct: -0.65, volume: '34.7M', marketCap: '$1.96T', pe: 51.3 },
  { ticker: 'GOOGL', name: 'Alphabet Inc.', sector: 'Communication Services', price: 175.98, change: 3.41, changePct: 1.98, volume: '28.9M', marketCap: '$2.18T', pe: 24.1 },
  { ticker: 'META', name: 'Meta Platforms Inc.', sector: 'Communication Services', price: 503.71, change: 8.24, changePct: 1.66, volume: '19.3M', marketCap: '$1.29T', pe: 27.8 },
  { ticker: 'TSLA', name: 'Tesla Inc.', sector: 'Consumer Discretionary', price: 177.58, change: -4.12, changePct: -2.27, volume: '91.6M', marketCap: '$566.4B', pe: 44.2 },
  { ticker: 'JPM', name: 'JPMorgan Chase', sector: 'Financials', price: 194.47, change: 2.11, changePct: 1.10, volume: '12.8M', marketCap: '$562.0B', pe: 11.8 },
  { ticker: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare', price: 147.02, change: 0.44, changePct: 0.30, volume: '7.9M', marketCap: '$354.3B', pe: 15.7 },
  { ticker: 'XOM', name: 'Exxon Mobil Corp.', sector: 'Energy', price: 115.43, change: -1.07, changePct: -0.92, volume: '15.6M', marketCap: '$465.5B', pe: 13.9 },
  { ticker: 'BRK.B', name: 'Berkshire Hathaway', sector: 'Financials', price: 408.22, change: 1.88, changePct: 0.46, volume: '3.2M', marketCap: '$893.1B', pe: 23.5 },
  { ticker: 'V', name: 'Visa Inc.', sector: 'Financials', price: 273.41, change: -0.89, changePct: -0.32, volume: '6.4M', marketCap: '$565.7B', pe: 29.8 },
  { ticker: 'WMT', name: 'Walmart Inc.', sector: 'Consumer Staples', price: 66.80, change: 0.55, changePct: 0.83, volume: '18.2M', marketCap: '$536.7B', pe: 29.2 },
  { ticker: 'UNH', name: 'UnitedHealth Group', sector: 'Healthcare', price: 492.80, change: 3.20, changePct: 0.65, volume: '3.4M', marketCap: '$453.6B', pe: 19.1 },
  { ticker: 'HD', name: 'Home Depot Inc.', sector: 'Consumer Discretionary', price: 337.15, change: -2.44, changePct: -0.72, volume: '4.1M', marketCap: '$335.6B', pe: 22.4 },
];

interface CacheEntry {
  price: number;
  change: number;
  changePct: number;
  ts: number;
}

@Injectable()
export class StocksService {
  private readonly cache = new Map<string, CacheEntry>();
  private readonly CACHE_TTL = 30_000; // 30 seconds

  constructor(private config: ConfigService) {}

  async getAll(): Promise<StockQuote[]> {
    const apiKey = this.config.get<string>('FINNHUB_API_KEY');
    if (apiKey) {
      await Promise.allSettled(STOCK_REGISTRY.map((s) => this.refreshCache(s.ticker)));
    }
    return STOCK_REGISTRY.map((s) => this.withCachedPrice(s));
  }

  async getOne(ticker: string): Promise<StockQuote> {
    const stock = STOCK_REGISTRY.find((s) => s.ticker === ticker.toUpperCase());
    if (!stock) throw new NotFoundException(`Stock ${ticker} not found`);
    await this.refreshCache(stock.ticker);
    return this.withCachedPrice(stock);
  }

  search(query: string): StockQuote[] {
    const q = query.toLowerCase();
    return STOCK_REGISTRY.filter(
      (s) =>
        s.ticker.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q),
    )
      .slice(0, 10)
      .map((s) => this.withCachedPrice(s));
  }

  async fetchFinnhubPrice(ticker: string): Promise<CacheEntry | null> {
    const apiKey = this.config.get<string>('FINNHUB_API_KEY');
    if (!apiKey) return null;

    try {
      const url = `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${apiKey}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (!res.ok) return null;
      const data = await res.json() as { c: number; d: number; dp: number };
      if (!data.c) return null;
      return { price: data.c, change: data.d, changePct: data.dp, ts: Date.now() };
    } catch {
      return null;
    }
  }

  async refreshCache(ticker: string): Promise<void> {
    const cached = this.cache.get(ticker);
    if (cached && Date.now() - cached.ts < this.CACHE_TTL) return;
    const entry = await this.fetchFinnhubPrice(ticker);
    if (entry) this.cache.set(ticker, entry);
  }

  // Synchronous price lookup — returns cached Finnhub price if fresh, otherwise static registry + drift
  getExecutionPrice(ticker: string): number {
    const cached = this.cache.get(ticker);
    if (cached && Date.now() - cached.ts < this.CACHE_TTL) return cached.price;
    const stock = STOCK_REGISTRY.find((s) => s.ticker === ticker.toUpperCase());
    if (!stock) throw new NotFoundException(`Stock ${ticker} not found`);
    const drift = (Math.random() - 0.495) * 0.005;
    return parseFloat((stock.price * (1 + drift)).toFixed(2));
  }

  private withCachedPrice(stock: StockQuote): StockQuote {
    const cached = this.cache.get(stock.ticker);
    if (cached && Date.now() - cached.ts < this.CACHE_TTL) {
      return { ...stock, price: cached.price, change: cached.change, changePct: cached.changePct };
    }
    return stock;
  }
}
