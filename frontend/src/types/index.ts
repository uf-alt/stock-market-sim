// ── Stock & Market ────────────────────────────────────────────────────────────

export interface Stock {
  ticker: string;
  name: string;
  sector: string;
  price: number;
  change: number;
  changePct: number;
  volume: string;
  marketCap: string;
  pe: number | null;
  high52: number;
  low52: number;
  open: number;
  high: number;
  low: number;
  description: string;
}

export interface MarketIndex {
  name: string;
  symbol: string;
  value: number;
  change: number;
  changePct: number;
}

export interface PricePoint {
  time: string;
  price: number;
}

// ── Portfolio & Holdings ──────────────────────────────────────────────────────

export interface Holding {
  ticker: string;
  name: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
  totalValue: number;
  totalCost: number;
  unrealizedGain: number;
  unrealizedGainPct: number;
  allocation: number; // % of portfolio
}

export interface Portfolio {
  id: string;
  cashBalance: number;
  totalValue: number;
  totalCost: number;
  unrealizedGain: number;
  unrealizedGainPct: number;
  realizedGain: number;
  dailyChange: number;
  dailyChangePct: number;
  holdings: Holding[];
}

export interface Transaction {
  id: string;
  type: "buy" | "sell";
  ticker: string;
  name: string;
  shares: number;
  price: number;
  total: number;
  timestamp: string;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  username: string;
  level: number;
  xp: number;
  xpToNext: number;
  streak: number;
  joinedAt: string;
}

// ── Gamification ──────────────────────────────────────────────────────────────

export interface Achievement {
  id: string;
  title: string;
  description: string;
  xp: number;
  unlockedAt: string | null;
}

// ── API ───────────────────────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: { message: string };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ── Pagination ────────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
}
