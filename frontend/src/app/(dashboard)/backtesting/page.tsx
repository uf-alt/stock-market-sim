"use client";

import { useState, useMemo } from "react";
import { useMarketStore } from "@/stores/market.store";
import { generatePriceHistory } from "@/lib/mock-data";
import {
  runBacktest,
  type BacktestConfig,
  type BacktestResult,
  type Strategy,
} from "@/lib/backtest";
import { formatCurrency, formatChange } from "@/utils/format";
import { Play } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

const PERIODS = [
  { label: "3M", days: 90 },
  { label: "6M", days: 180 },
  { label: "1Y", days: 365 },
  { label: "2Y", days: 730 },
  { label: "5Y", days: 1825 },
];

const STRATEGIES: { value: Strategy; label: string }[] = [
  { value: "buy-hold", label: "Buy & Hold" },
  { value: "sma-crossover", label: "SMA Crossover" },
  { value: "rsi", label: "RSI" },
];

function yTickFmt(v: number) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
}

export default function BacktestingPage() {
  const { stocks } = useMarketStore();

  // Config
  const [ticker, setTicker] = useState("AAPL");
  const [days, setDays] = useState(365);
  const [strategy, setStrategy] = useState<Strategy>("sma-crossover");
  const [capital, setCapital] = useState(10000);
  const [smaFast, setSmaFast] = useState(10);
  const [smaSlow, setSmaSlow] = useState(30);
  const [rsiPeriod, setRsiPeriod] = useState(14);
  const [rsiOversold, setRsiOversold] = useState(30);
  const [rsiOverbought, setRsiOverbought] = useState(70);

  const [result, setResult] = useState<BacktestResult | null>(null);

  // Price history — stable per ticker + days (only regenerates when either changes)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const priceHistory = useMemo(() => {
    const price = stocks.find((s) => s.ticker === ticker)?.price ?? 100;
    return generatePriceHistory(price, days);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticker, days]);

  const handleRun = () => {
    const config: BacktestConfig = {
      strategy,
      initialCapital: capital,
      smaFast,
      smaSlow,
      rsiPeriod,
      rsiOversold,
      rsiOverbought,
    };
    setResult(runBacktest(priceHistory, config));
  };

  const alpha =
    result
      ? result.metrics.totalReturnPct - result.metrics.benchmarkReturnPct
      : 0;

  const statCards = result
    ? [
        {
          label: "Total return",
          value: `${result.metrics.totalReturnPct >= 0 ? "+" : ""}${result.metrics.totalReturnPct.toFixed(2)}%`,
          color:
            result.metrics.totalReturnPct >= 0 ? "text-gain" : "text-loss",
        },
        {
          label: "vs Buy & Hold",
          value: `${alpha >= 0 ? "+" : ""}${alpha.toFixed(2)}%`,
          color: alpha >= 0 ? "text-gain" : "text-loss",
        },
        {
          label: "Max drawdown",
          value: `-${result.metrics.maxDrawdown.toFixed(2)}%`,
          color: "text-loss",
        },
        {
          label: "Sharpe ratio",
          value: result.metrics.sharpeRatio.toFixed(2),
          color:
            result.metrics.sharpeRatio >= 1
              ? "text-gain"
              : result.metrics.sharpeRatio >= 0
              ? "text-muted-foreground"
              : "text-loss",
        },
        {
          label: "Win rate",
          value:
            result.metrics.totalTrades > 0
              ? `${result.metrics.winRate.toFixed(1)}%`
              : "—",
          color:
            result.metrics.totalTrades === 0
              ? "text-muted-foreground"
              : result.metrics.winRate >= 50
              ? "text-gain"
              : "text-loss",
        },
        {
          label: "Trades",
          value: `${result.metrics.totalTrades}`,
          color: "text-foreground",
        },
      ]
    : [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Config panel */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        {/* Row 1: Stock / Period / Capital */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">
              Stock
            </label>
            <select
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-[13px] text-foreground outline-none focus:border-primary transition-colors"
            >
              {stocks.map((s) => (
                <option key={s.ticker} value={s.ticker}>
                  {s.ticker} — {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">
              Period
            </label>
            <div className="flex rounded-md bg-secondary p-0.5 gap-0.5">
              {PERIODS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => setDays(p.days)}
                  className={`flex-1 py-1.5 rounded text-[11px] font-semibold transition-colors ${
                    days === p.days
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">
              Initial capital
            </label>
            <input
              type="number"
              value={capital}
              min={100}
              step={1000}
              onChange={(e) => setCapital(Math.max(100, Number(e.target.value)))}
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-[13px] text-foreground font-mono outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        {/* Row 2: Strategy + params + run */}
        <div className="pt-4 border-t border-border flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">
              Strategy
            </label>
            <div className="flex gap-2">
              {STRATEGIES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setStrategy(s.value)}
                  className={`px-3 py-1.5 rounded-md text-[12px] font-semibold border transition-all ${
                    strategy === s.value
                      ? "bg-primary/10 border-primary/50 text-primary"
                      : "border-border text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {strategy === "sma-crossover" && (
            <div className="flex gap-3">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                  Fast
                </label>
                <input
                  type="number"
                  value={smaFast}
                  min={2}
                  max={smaSlow - 1}
                  onChange={(e) => setSmaFast(Math.max(2, Number(e.target.value)))}
                  className="w-16 bg-background border border-border rounded-md px-2 py-1.5 text-[13px] text-center font-mono outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                  Slow
                </label>
                <input
                  type="number"
                  value={smaSlow}
                  min={smaFast + 1}
                  onChange={(e) => setSmaSlow(Math.max(smaFast + 1, Number(e.target.value)))}
                  className="w-16 bg-background border border-border rounded-md px-2 py-1.5 text-[13px] text-center font-mono outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>
          )}

          {strategy === "rsi" && (
            <div className="flex gap-3">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                  Period
                </label>
                <input
                  type="number"
                  value={rsiPeriod}
                  min={2}
                  onChange={(e) => setRsiPeriod(Math.max(2, Number(e.target.value)))}
                  className="w-16 bg-background border border-border rounded-md px-2 py-1.5 text-[13px] text-center font-mono outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                  Oversold
                </label>
                <input
                  type="number"
                  value={rsiOversold}
                  min={1}
                  max={49}
                  onChange={(e) =>
                    setRsiOversold(Math.min(49, Math.max(1, Number(e.target.value))))
                  }
                  className="w-16 bg-background border border-border rounded-md px-2 py-1.5 text-[13px] text-center font-mono outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                  Overbought
                </label>
                <input
                  type="number"
                  value={rsiOverbought}
                  min={51}
                  max={99}
                  onChange={(e) =>
                    setRsiOverbought(Math.min(99, Math.max(51, Number(e.target.value))))
                  }
                  className="w-16 bg-background border border-border rounded-md px-2 py-1.5 text-[13px] text-center font-mono outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>
          )}

          <button
            onClick={handleRun}
            className="ml-auto flex items-center gap-2 px-5 py-2 rounded-md bg-primary text-primary-foreground text-[13px] font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all"
          >
            <Play size={12} />
            Run backtest
          </button>
        </div>
      </div>

      {/* ── Results ─────────────────────────────────────────────────────────── */}
      {result ? (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {statCards.map(({ label, value, color }) => (
              <div key={label} className="bg-card border border-border rounded-xl p-4">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                  {label}
                </p>
                <p className={`text-xl font-bold font-mono tracking-tight ${color}`}>
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* Best / Worst trade strip */}
          {result.metrics.totalTrades > 0 && (
            <div className="flex gap-3">
              <div className="flex-1 bg-card border border-border rounded-lg px-4 py-3 flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
                  Best trade
                </span>
                <span className="font-mono font-semibold text-[13px] text-gain">
                  +{result.metrics.bestTrade.toFixed(2)}%
                </span>
              </div>
              <div className="flex-1 bg-card border border-border rounded-lg px-4 py-3 flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
                  Worst trade
                </span>
                <span className="font-mono font-semibold text-[13px] text-loss">
                  {result.metrics.worstTrade.toFixed(2)}%
                </span>
              </div>
              <div className="flex-1 bg-card border border-border rounded-lg px-4 py-3 flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
                  Benchmark return
                </span>
                <span
                  className={`font-mono font-semibold text-[13px] ${
                    result.metrics.benchmarkReturnPct >= 0 ? "text-gain" : "text-loss"
                  }`}
                >
                  {result.metrics.benchmarkReturnPct >= 0 ? "+" : ""}
                  {result.metrics.benchmarkReturnPct.toFixed(2)}%
                </span>
              </div>
            </div>
          )}

          {/* Equity curve */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-start justify-between mb-5">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Equity curve
                </p>
                <p className="text-2xl font-bold font-mono mt-1 tracking-tight">
                  {formatCurrency(result.equity[result.equity.length - 1]?.value ?? capital)}
                </p>
                <p
                  className={`text-[13px] font-semibold mt-0.5 ${
                    result.metrics.totalReturn >= 0 ? "text-gain" : "text-loss"
                  }`}
                >
                  {formatChange(result.metrics.totalReturn)} ({result.metrics.totalReturnPct >= 0 ? "+" : ""}
                  {result.metrics.totalReturnPct.toFixed(2)}%)
                </p>
              </div>
              <div className="flex items-center gap-5 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-2">
                  <span className="w-4 h-0.5 bg-primary inline-block rounded" />
                  Strategy
                </span>
                <span className="flex items-center gap-2">
                  <span
                    className="w-4 inline-block rounded"
                    style={{
                      height: "1px",
                      background: "var(--muted-foreground)",
                      borderTop: "1.5px dashed var(--muted-foreground)",
                    }}
                  />
                  Buy &amp; Hold
                </span>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={result.equity}>
                <defs>
                  <linearGradient id="stratGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c96520" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#c96520" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                  tickLine={false}
                  axisLine={false}
                  width={70}
                  tickFormatter={yTickFmt}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "var(--foreground)",
                  }}
                  formatter={(v, name) => [
                    formatCurrency(Number(v)),
                    name === "value" ? "Strategy" : "Buy & Hold",
                  ]}
                />
                <ReferenceLine
                  y={capital}
                  stroke="var(--border)"
                  strokeDasharray="3 3"
                />
                {/* Benchmark — dashed gray, no fill */}
                <Area
                  type="monotone"
                  dataKey="benchmark"
                  stroke="var(--muted-foreground)"
                  strokeWidth={1.5}
                  strokeDasharray="5 4"
                  fill="none"
                  dot={false}
                />
                {/* Strategy — orange with gradient fill */}
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#c96520"
                  strokeWidth={2}
                  fill="url(#stratGrad)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Trade log */}
          {result.trades.length > 0 ? (
            <div>
              <div className="flex items-center justify-between pb-3.5">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                  Trade log
                </p>
                <p className="text-[12px] text-muted-foreground/60">
                  {result.trades.length} executions
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[13px] border-collapse">
                  <thead>
                    <tr>
                      {["Date", "Type", "Price", "Shares", "Value", "P&L", "P&L %"].map(
                        (h, i) => (
                          <th
                            key={h}
                            className={`text-[10px] uppercase tracking-wider text-muted-foreground/70 py-2.5 px-4 font-semibold border-y border-border bg-transparent ${
                              i < 2 ? "text-left" : "text-right"
                            }`}
                          >
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {result.trades.map((trade, i) => (
                      <tr key={i} className="hover:bg-primary/5 transition-colors">
                        <td
                          className={`py-3 px-4 text-muted-foreground font-mono ${
                            i > 0 ? "border-t border-border" : ""
                          }`}
                        >
                          {trade.date}
                        </td>
                        <td
                          className={`py-3 px-4 ${i > 0 ? "border-t border-border" : ""}`}
                        >
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                              trade.type === "buy"
                                ? "bg-gain/10 text-gain"
                                : "bg-loss/10 text-loss"
                            }`}
                          >
                            {trade.type}
                          </span>
                        </td>
                        <td
                          className={`py-3 px-4 text-right font-mono ${
                            i > 0 ? "border-t border-border" : ""
                          }`}
                        >
                          {formatCurrency(trade.price)}
                        </td>
                        <td
                          className={`py-3 px-4 text-right text-muted-foreground font-mono ${
                            i > 0 ? "border-t border-border" : ""
                          }`}
                        >
                          {trade.shares}
                        </td>
                        <td
                          className={`py-3 px-4 text-right font-mono font-semibold ${
                            i > 0 ? "border-t border-border" : ""
                          }`}
                        >
                          {formatCurrency(trade.value)}
                        </td>
                        <td
                          className={`py-3 px-4 text-right font-mono ${
                            i > 0 ? "border-t border-border" : ""
                          }`}
                        >
                          {trade.pnl !== null ? (
                            <span
                              className={trade.pnl >= 0 ? "text-gain" : "text-loss"}
                            >
                              {formatChange(trade.pnl)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td
                          className={`py-3 px-4 text-right font-mono ${
                            i > 0 ? "border-t border-border" : ""
                          }`}
                        >
                          {trade.pnlPct !== null ? (
                            <span
                              className={trade.pnlPct >= 0 ? "text-gain" : "text-loss"}
                            >
                              {trade.pnlPct >= 0 ? "+" : ""}
                              {trade.pnlPct.toFixed(2)}%
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl p-8 text-center">
              <p className="text-muted-foreground text-[14px]">
                No trades were executed with these settings. Try a longer period or
                adjust the strategy parameters.
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <p className="text-[13px] text-muted-foreground">
            Configure a strategy above and click{" "}
            <span className="text-foreground font-semibold">Run backtest</span> to
            simulate performance against historical price data.
          </p>
        </div>
      )}
    </div>
  );
}
