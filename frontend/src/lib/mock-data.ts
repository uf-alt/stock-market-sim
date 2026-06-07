import type { Stock, MarketIndex, Portfolio, Transaction, User, PricePoint } from "@/types";

// ── Market Indices ────────────────────────────────────────────────────────────

export const MARKET_INDICES: MarketIndex[] = [
  { name: "S&P 500", symbol: "SPX", value: 5248.49, change: 23.11, changePct: 0.44 },
  { name: "NASDAQ", symbol: "IXIC", value: 16742.39, change: -41.22, changePct: -0.25 },
  { name: "DOW", symbol: "DJI", value: 39103.44, change: 134.21, changePct: 0.34 },
  { name: "Russell 2000", symbol: "RUT", value: 2067.37, change: -8.14, changePct: -0.39 },
];

// ── Stocks ────────────────────────────────────────────────────────────────────

export const STOCKS: Stock[] = [
  {
    ticker: "AAPL",
    name: "Apple Inc.",
    sector: "Technology",
    price: 213.49,
    change: 2.14,
    changePct: 1.01,
    volume: "48.2M",
    marketCap: "$3.28T",
    pe: 33.4,
    high52: 237.23,
    low52: 164.08,
    open: 211.52,
    high: 214.01,
    low: 211.07,
    description: "Apple designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories.",
  },
  {
    ticker: "MSFT",
    name: "Microsoft Corp.",
    sector: "Technology",
    price: 425.27,
    change: 5.82,
    changePct: 1.39,
    volume: "21.1M",
    marketCap: "$3.16T",
    pe: 36.2,
    high52: 468.35,
    low52: 309.45,
    open: 419.80,
    high: 426.11,
    low: 419.10,
    description: "Microsoft develops, licenses, and supports software, services, devices, and solutions worldwide.",
  },
  {
    ticker: "NVDA",
    name: "NVIDIA Corp.",
    sector: "Technology",
    price: 875.39,
    change: 24.18,
    changePct: 2.84,
    volume: "62.4M",
    marketCap: "$2.15T",
    pe: 68.1,
    high52: 974.00,
    low52: 402.75,
    open: 854.22,
    high: 878.90,
    low: 850.00,
    description: "NVIDIA designs GPUs for gaming, professional visualization, data centers, and automotive markets.",
  },
  {
    ticker: "AMZN",
    name: "Amazon.com Inc.",
    sector: "Consumer Discretionary",
    price: 187.44,
    change: -1.23,
    changePct: -0.65,
    volume: "34.7M",
    marketCap: "$1.96T",
    pe: 51.3,
    high52: 201.20,
    low52: 118.35,
    open: 189.00,
    high: 189.75,
    low: 186.80,
    description: "Amazon engages in e-commerce, cloud computing, digital streaming, and artificial intelligence.",
  },
  {
    ticker: "GOOGL",
    name: "Alphabet Inc.",
    sector: "Communication Services",
    price: 175.98,
    change: 3.41,
    changePct: 1.98,
    volume: "28.9M",
    marketCap: "$2.18T",
    pe: 24.1,
    high52: 193.31,
    low52: 120.21,
    open: 172.80,
    high: 176.50,
    low: 172.10,
    description: "Alphabet is a holding company with Google as its primary subsidiary, operating search, cloud, and advertising.",
  },
  {
    ticker: "META",
    name: "Meta Platforms Inc.",
    sector: "Communication Services",
    price: 503.71,
    change: 8.24,
    changePct: 1.66,
    volume: "19.3M",
    marketCap: "$1.29T",
    pe: 27.8,
    high52: 531.49,
    low52: 274.38,
    open: 495.50,
    high: 505.20,
    low: 494.10,
    description: "Meta builds technologies that help people connect. Its products include Facebook, Instagram, and WhatsApp.",
  },
  {
    ticker: "TSLA",
    name: "Tesla Inc.",
    sector: "Consumer Discretionary",
    price: 177.58,
    change: -4.12,
    changePct: -2.27,
    volume: "91.6M",
    marketCap: "$566.4B",
    pe: 44.2,
    high52: 299.29,
    low52: 138.80,
    open: 182.00,
    high: 183.40,
    low: 176.90,
    description: "Tesla designs, develops, manufactures, leases, and sells electric vehicles and energy generation and storage systems.",
  },
  {
    ticker: "BRK.B",
    name: "Berkshire Hathaway",
    sector: "Financials",
    price: 408.22,
    change: 1.88,
    changePct: 0.46,
    volume: "3.2M",
    marketCap: "$893.1B",
    pe: 23.5,
    high52: 417.00,
    low52: 322.00,
    open: 406.80,
    high: 409.50,
    low: 406.10,
    description: "Berkshire Hathaway is a multinational conglomerate holding company with major insurance, railroad, and utility operations.",
  },
  {
    ticker: "JPM",
    name: "JPMorgan Chase",
    sector: "Financials",
    price: 194.47,
    change: 2.11,
    changePct: 1.10,
    volume: "12.8M",
    marketCap: "$562.0B",
    pe: 11.8,
    high52: 205.88,
    low52: 135.19,
    open: 192.50,
    high: 195.20,
    low: 192.00,
    description: "JPMorgan Chase is a leading global financial services firm with operations in consumer, corporate, and investment banking.",
  },
  {
    ticker: "V",
    name: "Visa Inc.",
    sector: "Financials",
    price: 273.41,
    change: -0.89,
    changePct: -0.32,
    volume: "6.4M",
    marketCap: "$565.7B",
    pe: 29.8,
    high52: 290.96,
    low52: 227.56,
    open: 274.30,
    high: 274.80,
    low: 272.50,
    description: "Visa operates the world's largest retail electronic payments network, facilitating transactions between consumers, merchants, banks and governments.",
  },
  {
    ticker: "JNJ",
    name: "Johnson & Johnson",
    sector: "Healthcare",
    price: 147.02,
    change: 0.44,
    changePct: 0.30,
    volume: "7.9M",
    marketCap: "$354.3B",
    pe: 15.7,
    high52: 168.85,
    low52: 143.13,
    open: 146.80,
    high: 147.50,
    low: 146.40,
    description: "Johnson & Johnson is a multinational corporation that develops medical devices, pharmaceutical and consumer packaged goods.",
  },
  {
    ticker: "XOM",
    name: "Exxon Mobil Corp.",
    sector: "Energy",
    price: 115.43,
    change: -1.07,
    changePct: -0.92,
    volume: "15.6M",
    marketCap: "$465.5B",
    pe: 13.9,
    high52: 123.75,
    low52: 95.77,
    open: 116.80,
    high: 117.00,
    low: 115.10,
    description: "Exxon Mobil is an American multinational oil and gas corporation that explores, produces, transports, and sells crude oil and natural gas.",
  },
  {
    ticker: "WMT",
    name: "Walmart Inc.",
    sector: "Consumer Staples",
    price: 66.80,
    change: 0.55,
    changePct: 0.83,
    volume: "18.2M",
    marketCap: "$536.7B",
    pe: 29.2,
    high52: 71.92,
    low52: 46.64,
    open: 66.40,
    high: 67.10,
    low: 66.20,
    description: "Walmart is a multinational retail corporation that operates a chain of hypermarkets, discount department stores, and grocery stores.",
  },
  {
    ticker: "UNH",
    name: "UnitedHealth Group",
    sector: "Healthcare",
    price: 492.80,
    change: 3.20,
    changePct: 0.65,
    volume: "3.4M",
    marketCap: "$453.6B",
    pe: 19.1,
    high52: 584.55,
    low52: 427.00,
    open: 489.50,
    high: 494.00,
    low: 488.80,
    description: "UnitedHealth Group is a diversified health care company offering consumer-oriented health benefit plans and services.",
  },
  {
    ticker: "HD",
    name: "Home Depot Inc.",
    sector: "Consumer Discretionary",
    price: 337.15,
    change: -2.44,
    changePct: -0.72,
    volume: "4.1M",
    marketCap: "$335.6B",
    pe: 22.4,
    high52: 395.00,
    low52: 274.26,
    open: 339.80,
    high: 340.50,
    low: 336.50,
    description: "Home Depot is the largest home improvement retailer in the United States, supplying tools, construction products, and services.",
  },
];

// ── Price History Generator ───────────────────────────────────────────────────

export function generatePriceHistory(
  basePrice: number,
  days: number,
  volatility = 0.015
): PricePoint[] {
  const points: PricePoint[] = [];
  let price = basePrice * (1 - (Math.random() * 0.15 + 0.05));
  const now = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const change = (Math.random() - 0.48) * volatility * price;
    price = Math.max(price + change, price * 0.5);
    points.push({
      time: date.toISOString().split("T")[0],
      price: parseFloat(price.toFixed(2)),
    });
  }

  // Ensure last point matches current price
  if (points.length > 0) {
    points[points.length - 1].price = basePrice;
  }

  return points;
}

// ── Mock User ─────────────────────────────────────────────────────────────────

export const MOCK_USER: User = {
  id: "user-1",
  email: "alex@example.com",
  username: "alexchen",
  level: 7,
  xp: 3240,
  xpToNext: 4000,
  streak: 12,
  joinedAt: "2024-01-15",
};

// ── Mock Portfolio ────────────────────────────────────────────────────────────

export const MOCK_PORTFOLIO: Portfolio = {
  id: "portfolio-1",
  cashBalance: 23_480.12,
  totalValue: 114_832.50,
  totalCost: 100_000,
  unrealizedGain: 14_832.50,
  unrealizedGainPct: 14.83,
  realizedGain: 2_140.88,
  dailyChange: 834.22,
  dailyChangePct: 0.73,
  holdings: [
    {
      ticker: "AAPL",
      name: "Apple Inc.",
      shares: 35,
      avgCost: 178.42,
      currentPrice: 213.49,
      totalValue: 7_472.15,
      totalCost: 6_244.70,
      unrealizedGain: 1_227.45,
      unrealizedGainPct: 19.65,
      allocation: 8.21,
    },
    {
      ticker: "NVDA",
      name: "NVIDIA Corp.",
      shares: 20,
      avgCost: 612.40,
      currentPrice: 875.39,
      totalValue: 17_507.80,
      totalCost: 12_248.00,
      unrealizedGain: 5_259.80,
      unrealizedGainPct: 42.94,
      allocation: 19.26,
    },
    {
      ticker: "MSFT",
      name: "Microsoft Corp.",
      shares: 25,
      avgCost: 380.15,
      currentPrice: 425.27,
      totalValue: 10_631.75,
      totalCost: 9_503.75,
      unrealizedGain: 1_128.00,
      unrealizedGainPct: 11.87,
      allocation: 11.69,
    },
    {
      ticker: "AMZN",
      name: "Amazon.com Inc.",
      shares: 50,
      avgCost: 172.80,
      currentPrice: 187.44,
      totalValue: 9_372.00,
      totalCost: 8_640.00,
      unrealizedGain: 732.00,
      unrealizedGainPct: 8.47,
      allocation: 10.30,
    },
    {
      ticker: "V",
      name: "Visa Inc.",
      shares: 30,
      avgCost: 258.90,
      currentPrice: 273.41,
      totalValue: 8_202.30,
      totalCost: 7_767.00,
      unrealizedGain: 435.30,
      unrealizedGainPct: 5.60,
      allocation: 9.02,
    },
    {
      ticker: "TSLA",
      name: "Tesla Inc.",
      shares: 60,
      avgCost: 195.40,
      currentPrice: 177.58,
      totalValue: 10_654.80,
      totalCost: 11_724.00,
      unrealizedGain: -1_069.20,
      unrealizedGainPct: -9.12,
      allocation: 11.72,
    },
    {
      ticker: "JNJ",
      name: "Johnson & Johnson",
      shares: 40,
      avgCost: 150.22,
      currentPrice: 147.02,
      totalValue: 5_880.80,
      totalCost: 6_008.80,
      unrealizedGain: -128.00,
      unrealizedGainPct: -2.13,
      allocation: 6.47,
    },
  ],
};

// ── Mock Transactions ─────────────────────────────────────────────────────────

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: "t1", type: "buy", ticker: "NVDA", name: "NVIDIA Corp.", shares: 10, price: 854.20, total: 8_542.00, timestamp: "2024-05-20T14:32:00Z" },
  { id: "t2", type: "buy", ticker: "AAPL", name: "Apple Inc.", shares: 15, price: 182.40, total: 2_736.00, timestamp: "2024-05-19T10:11:00Z" },
  { id: "t3", type: "sell", ticker: "GOOGL", name: "Alphabet Inc.", shares: 20, price: 172.80, total: 3_456.00, timestamp: "2024-05-17T15:48:00Z" },
  { id: "t4", type: "buy", ticker: "TSLA", name: "Tesla Inc.", shares: 30, price: 189.20, total: 5_676.00, timestamp: "2024-05-14T09:22:00Z" },
  { id: "t5", type: "buy", ticker: "MSFT", name: "Microsoft Corp.", shares: 10, price: 410.50, total: 4_105.00, timestamp: "2024-05-10T11:05:00Z" },
  { id: "t6", type: "sell", ticker: "META", name: "Meta Platforms Inc.", shares: 8, price: 490.30, total: 3_922.40, timestamp: "2024-05-08T14:19:00Z" },
];

// ── Watchlist ─────────────────────────────────────────────────────────────────

export const MOCK_WATCHLIST: string[] = ["GOOGL", "META", "BRK.B", "WMT"];

export function getStockByTicker(ticker: string): Stock | undefined {
  return STOCKS.find((s) => s.ticker === ticker);
}

export function getSectorColor(sector: string): string {
  const map: Record<string, string> = {
    Technology: "#c96520",
    "Communication Services": "#0ecb81",
    "Consumer Discretionary": "#f0b90b",
    Financials: "#3b82f6",
    Healthcare: "#a855f7",
    Energy: "#ef4444",
    "Consumer Staples": "#06b6d4",
    Industrials: "#f97316",
    Materials: "#84cc16",
  };
  return map[sector] || "#9a8e80";
}
