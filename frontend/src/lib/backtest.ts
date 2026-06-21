import type { PricePoint } from "@/types";

export type Strategy = "buy-hold" | "sma-crossover" | "rsi";

export interface BacktestConfig {
  strategy: Strategy;
  initialCapital: number;
  smaFast: number;
  smaSlow: number;
  rsiPeriod: number;
  rsiOversold: number;
  rsiOverbought: number;
}

export interface BacktestTrade {
  date: string;
  type: "buy" | "sell";
  price: number;
  shares: number;
  value: number;
  pnl: number | null;
  pnlPct: number | null;
}

export interface BacktestMetrics {
  totalReturn: number;
  totalReturnPct: number;
  benchmarkReturn: number;
  benchmarkReturnPct: number;
  maxDrawdown: number;
  sharpeRatio: number;
  winRate: number;
  totalTrades: number;
  bestTrade: number;
  worstTrade: number;
}

export interface EquityPoint {
  time: string;
  value: number;
  benchmark: number;
}

export interface BacktestResult {
  equity: EquityPoint[];
  trades: BacktestTrade[];
  metrics: BacktestMetrics;
}

// ── Indicators ───────────────────────────────────────────────────────────────

function calcSMA(prices: number[], period: number): (number | null)[] {
  return prices.map((_, i) => {
    if (i < period - 1) return null;
    const slice = prices.slice(i - period + 1, i + 1);
    return slice.reduce((a, b) => a + b, 0) / period;
  });
}

function calcRSI(prices: number[], period: number): (number | null)[] {
  const result: (number | null)[] = [];
  if (prices.length < period + 1) return new Array(prices.length).fill(null);

  for (let i = 0; i < period; i++) result.push(null);

  let avgGain = 0;
  let avgLoss = 0;
  for (let i = 1; i <= period; i++) {
    const d = prices[i] - prices[i - 1];
    if (d > 0) avgGain += d;
    else avgLoss += Math.abs(d);
  }
  avgGain /= period;
  avgLoss /= period;

  const firstRS = avgLoss === 0 ? 100 : avgGain / avgLoss;
  result.push(100 - 100 / (1 + firstRS));

  for (let i = period + 1; i < prices.length; i++) {
    const d = prices[i] - prices[i - 1];
    const gain = d > 0 ? d : 0;
    const loss = d < 0 ? Math.abs(d) : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    result.push(100 - 100 / (1 + rs));
  }

  return result;
}

// ── Signal Generation ────────────────────────────────────────────────────────

type Signal = "buy" | "sell" | null;

function getSignals(prices: number[], config: BacktestConfig): Signal[] {
  const n = prices.length;
  const signals: Signal[] = new Array(n).fill(null);

  if (config.strategy === "buy-hold") {
    if (n > 0) signals[0] = "buy";
    if (n > 1) signals[n - 1] = "sell";
    return signals;
  }

  if (config.strategy === "sma-crossover") {
    const fast = calcSMA(prices, config.smaFast);
    const slow = calcSMA(prices, config.smaSlow);
    for (let i = 1; i < n; i++) {
      const pf = fast[i - 1], ps = slow[i - 1];
      const cf = fast[i], cs = slow[i];
      if (pf === null || ps === null || cf === null || cs === null) continue;
      if (pf <= ps && cf > cs) signals[i] = "buy";
      else if (pf >= ps && cf < cs) signals[i] = "sell";
    }
    return signals;
  }

  if (config.strategy === "rsi") {
    const rsiVals = calcRSI(prices, config.rsiPeriod);
    for (let i = 1; i < n; i++) {
      const prev = rsiVals[i - 1], curr = rsiVals[i];
      if (prev === null || curr === null) continue;
      // Enter oversold zone → buy
      if (prev >= config.rsiOversold && curr < config.rsiOversold) signals[i] = "buy";
      // Enter overbought zone → sell
      else if (prev <= config.rsiOverbought && curr > config.rsiOverbought) signals[i] = "sell";
    }
    return signals;
  }

  return signals;
}

// ── Main Engine ──────────────────────────────────────────────────────────────

export function runBacktest(
  priceHistory: PricePoint[],
  config: BacktestConfig
): BacktestResult {
  const prices = priceHistory.map((p) => p.price);
  const dates = priceHistory.map((p) => p.time);
  const n = prices.length;

  if (n < 2) return { equity: [], trades: [], metrics: emptyMetrics() };

  const benchmarkShares = config.initialCapital / prices[0];
  const signals = getSignals(prices, config);

  let cash = config.initialCapital;
  let shares = 0;
  let entryPrice = 0;
  const trades: BacktestTrade[] = [];
  const equity: EquityPoint[] = [];

  for (let i = 0; i < n; i++) {
    const price = prices[i];
    const signal = signals[i];

    if (signal === "buy" && shares === 0 && cash > 0) {
      shares = Math.floor(cash / price);
      if (shares > 0) {
        const cost = shares * price;
        cash -= cost;
        entryPrice = price;
        trades.push({ date: dates[i], type: "buy", price, shares, value: cost, pnl: null, pnlPct: null });
      }
    } else if (signal === "sell" && shares > 0) {
      const proceeds = shares * price;
      const pnl = proceeds - shares * entryPrice;
      const pnlPct = ((price - entryPrice) / entryPrice) * 100;
      trades.push({ date: dates[i], type: "sell", price, shares, value: proceeds, pnl, pnlPct });
      cash += proceeds;
      shares = 0;
    }

    equity.push({
      time: dates[i],
      value: parseFloat((cash + shares * price).toFixed(2)),
      benchmark: parseFloat((benchmarkShares * price).toFixed(2)),
    });
  }

  // Force-close any open position at end
  if (shares > 0) {
    const price = prices[n - 1];
    const proceeds = shares * price;
    const pnl = proceeds - shares * entryPrice;
    const pnlPct = ((price - entryPrice) / entryPrice) * 100;
    trades.push({ date: dates[n - 1], type: "sell", price, shares, value: proceeds, pnl, pnlPct });
    cash += proceeds;
    shares = 0;
    equity[equity.length - 1].value = parseFloat(cash.toFixed(2));
  }

  const finalValue = cash;
  const benchmarkFinal = benchmarkShares * prices[n - 1];

  // Max drawdown
  let peak = equity[0]?.value ?? config.initialCapital;
  let maxDrawdown = 0;
  for (const pt of equity) {
    if (pt.value > peak) peak = pt.value;
    const dd = ((peak - pt.value) / peak) * 100;
    if (dd > maxDrawdown) maxDrawdown = dd;
  }

  // Annualized Sharpe ratio (risk-free rate = 0)
  const dailyReturns = equity
    .slice(1)
    .map((pt, i) => (pt.value - equity[i].value) / equity[i].value);
  const mean = dailyReturns.reduce((a, b) => a + b, 0) / (dailyReturns.length || 1);
  const variance =
    dailyReturns.reduce((a, b) => a + (b - mean) ** 2, 0) / (dailyReturns.length || 1);
  const sharpeRatio =
    variance === 0 ? 0 : parseFloat(((mean / Math.sqrt(variance)) * Math.sqrt(252)).toFixed(2));

  const sellTrades = trades.filter((t) => t.type === "sell" && t.pnl !== null);
  const winners = sellTrades.filter((t) => (t.pnl ?? 0) > 0);
  const pnlPcts = sellTrades.map((t) => t.pnlPct ?? 0);

  return {
    equity,
    trades,
    metrics: {
      totalReturn: finalValue - config.initialCapital,
      totalReturnPct: ((finalValue - config.initialCapital) / config.initialCapital) * 100,
      benchmarkReturn: benchmarkFinal - config.initialCapital,
      benchmarkReturnPct: ((benchmarkFinal - config.initialCapital) / config.initialCapital) * 100,
      maxDrawdown,
      sharpeRatio,
      winRate: sellTrades.length > 0 ? (winners.length / sellTrades.length) * 100 : 0,
      totalTrades: sellTrades.length,
      bestTrade: pnlPcts.length > 0 ? Math.max(...pnlPcts) : 0,
      worstTrade: pnlPcts.length > 0 ? Math.min(...pnlPcts) : 0,
    },
  };
}

function emptyMetrics(): BacktestMetrics {
  return {
    totalReturn: 0,
    totalReturnPct: 0,
    benchmarkReturn: 0,
    benchmarkReturnPct: 0,
    maxDrawdown: 0,
    sharpeRatio: 0,
    winRate: 0,
    totalTrades: 0,
    bestTrade: 0,
    worstTrade: 0,
  };
}
