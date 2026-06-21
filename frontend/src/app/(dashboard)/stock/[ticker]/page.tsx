"use client";

import { use, useState, useMemo } from "react";
import Link from "next/link";
import { generatePriceHistory } from "@/lib/mock-data";
import { usePortfolioStore } from "@/stores/portfolio.store";
import { useMarketStore } from "@/stores/market.store";
import { formatCurrency, formatPercent, formatChange } from "@/utils/format";
import { AlertTriangle, Star, ArrowLeft } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { PricePoint } from "@/types";

const TIMEFRAMES = [
  { label: "1D", days: 1 },
  { label: "1W", days: 7 },
  { label: "1M", days: 30 },
  { label: "3M", days: 90 },
  { label: "1Y", days: 365 },
  { label: "ALL", days: 1825 },
];

export default function StockDetailPage({
  params,
}: {
  params: Promise<{ ticker: string }>;
}) {
  const { ticker } = use(params);
  const { stocks } = useMarketStore();
  const stock = stocks.find((s) => s.ticker === ticker.toUpperCase());
  const { portfolio, executeTrade, isLoading } = usePortfolioStore();
  const { toggleWatchlist, isWatched } = useMarketStore();

  const [timeframe, setTimeframe] = useState("1M");
  const [quantity, setQuantity] = useState(1);
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy");
  const [tradeMsg, setTradeMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const history = useMemo<PricePoint[]>(() => {
    if (!stock) return [];
    const days = TIMEFRAMES.find((t) => t.label === timeframe)?.days ?? 30;
    return generatePriceHistory(stock.price, days);
  }, [stock?.ticker, stock?.price, timeframe]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!stock) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-muted-foreground text-[15px]">Stock &ldquo;{ticker}&rdquo; not found.</p>
        <Link href="/markets" className="text-primary font-semibold hover:underline text-[13px]">
          ← Back to Markets
        </Link>
      </div>
    );
  }

  const holding = portfolio.holdings.find((h) => h.ticker === stock.ticker);
  const estimatedCost = stock.price * quantity;
  const canBuy = portfolio.cashBalance >= estimatedCost;
  const canSell = (holding?.shares ?? 0) >= quantity;
  const singleStockPct = holding
    ? (holding.totalValue / portfolio.totalValue) * 100 + (tradeType === "buy" ? (estimatedCost / portfolio.totalValue) * 100 : 0)
    : (estimatedCost / portfolio.totalValue) * 100;
  const showDiversificationWarning = tradeType === "buy" && singleStockPct > 25;

  const handleTrade = async () => {
    setTradeMsg(null);
    const result = await executeTrade(stock.ticker, quantity, tradeType, stock.price);
    if (result.success) {
      setTradeMsg({ type: "success", text: `${tradeType === "buy" ? "Bought" : "Sold"} ${quantity} share${quantity > 1 ? "s" : ""} of ${stock.ticker}` });
      setQuantity(1);
    } else {
      setTradeMsg({ type: "error", text: result.error ?? "Trade failed" });
    }
  };

  const chartColor = stock.changePct >= 0 ? "#0ecb81" : "#f6465d";
  const startPrice = history[0]?.price ?? stock.price;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Back link */}
      <Link
        href="/markets"
        className="flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={14} />
        Back to Markets
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-card border border-border flex items-center justify-center text-[13px] font-black text-muted-foreground flex-shrink-0">
            {stock.ticker.slice(0, 2)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-3xl font-bold font-mono tracking-tight">
                {stock.ticker}
              </h2>
              <button
                onClick={() => toggleWatchlist(stock.ticker)}
                className={`ml-1 transition-colors ${isWatched(stock.ticker) ? "text-amber-400" : "text-muted-foreground hover:text-amber-400"}`}
              >
                <Star size={18} fill={isWatched(stock.ticker) ? "currentColor" : "none"} />
              </button>
            </div>
            <p className="text-[14px] text-muted-foreground">{stock.name}</p>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
              {stock.sector}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-4xl font-bold tracking-tight font-mono">
            {formatCurrency(stock.price)}
          </p>
          <p className={`text-[15px] font-semibold mt-0.5 ${stock.changePct >= 0 ? "text-gain" : "text-loss"}`}>
            {formatChange(stock.change)} ({formatPercent(stock.changePct)})
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chart + metrics */}
        <div className="lg:col-span-2 space-y-5">
          {/* Chart */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex gap-1 mb-5">
              {TIMEFRAMES.map((tf) => (
                <button
                  key={tf.label}
                  onClick={() => setTimeframe(tf.label)}
                  className={`px-3 py-1 rounded-lg text-[12px] font-semibold transition-colors ${
                    timeframe === tf.label
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColor} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
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
                  domain={["auto", "auto"]}
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                  tickLine={false}
                  axisLine={false}
                  width={65}
                  tickFormatter={(v) => `$${v.toFixed(0)}`}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "var(--foreground)",
                  }}
                  formatter={(v) => [formatCurrency(Number(v)), "Price"]}
                />
                <ReferenceLine y={startPrice} stroke="var(--border)" strokeDasharray="3 3" />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={chartColor}
                  strokeWidth={2}
                  fill="url(#chartGrad)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Key metrics */}
          <div className="grid grid-cols-3 gap-3">
            {[
              ["Open", formatCurrency(stock.open)],
              ["High", formatCurrency(stock.high)],
              ["Low", formatCurrency(stock.low)],
              ["Volume", stock.volume],
              ["Market Cap", stock.marketCap],
              ["P/E Ratio", stock.pe?.toFixed(1) ?? "N/A"],
              ["52W High", formatCurrency(stock.high52)],
              ["52W Low", formatCurrency(stock.low52)],
              ["Sector", stock.sector],
            ].map(([label, value]) => (
              <div key={label} className="bg-card border border-border rounded-lg px-4 py-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mb-1">
                  {label}
                </p>
                <p className="text-[14px] font-bold text-foreground truncate">{value}</p>
              </div>
            ))}
          </div>

          {/* About */}
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
              About
            </p>
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              {stock.description}
            </p>
          </div>
        </div>

        {/* Trading panel */}
        <div className="space-y-4">
          {holding && (
            <div className="bg-card border border-border rounded-xl p-5">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-3">
                Your Position
              </p>
              <div className="space-y-1.5">
                {[
                  ["Shares", `${holding.shares}`],
                  ["Avg Cost", formatCurrency(holding.avgCost)],
                  ["Total Value", formatCurrency(holding.totalValue)],
                  ["Unrealized P&L", formatChange(holding.unrealizedGain)],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-[13px]">
                    <span className="text-muted-foreground">{k}</span>
                    <span
                      className={`font-semibold ${
                        k === "Unrealized P&L"
                          ? holding.unrealizedGain >= 0
                            ? "text-gain"
                            : "text-loss"
                          : "text-foreground"
                      }`}
                    >
                      {v}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-card border border-border rounded-xl p-5">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-4">
              Trade {stock.ticker}
            </p>

            {/* Buy/Sell toggle */}
            <div className="flex rounded-md bg-secondary p-1 mb-4">
              {(["buy", "sell"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTradeType(t)}
                  className={`flex-1 py-1.5 rounded text-[12px] font-semibold capitalize transition-colors ${
                    tradeType === t
                      ? t === "buy"
                        ? "bg-gain text-white"
                        : "bg-loss text-white"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Quantity */}
            <div className="mb-4">
              <label className="block text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5">
                Quantity (shares)
              </label>
              <div className="flex items-center border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-2.5 text-muted-foreground hover:bg-secondary transition-colors text-lg leading-none"
                >
                  −
                </button>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="flex-1 text-center bg-transparent outline-none text-[15px] font-bold text-foreground py-2.5"
                />
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3 py-2.5 text-muted-foreground hover:bg-secondary transition-colors text-lg leading-none"
                >
                  +
                </button>
              </div>
            </div>

            {/* Cost summary */}
            <div className="space-y-1.5 mb-4">
              <div className="flex justify-between text-[13px]">
                <span className="text-muted-foreground">Market price</span>
                <span className="font-semibold">{formatCurrency(stock.price)}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-muted-foreground">Est. {tradeType === "buy" ? "cost" : "proceeds"}</span>
                <span className="font-bold text-foreground">{formatCurrency(estimatedCost)}</span>
              </div>
              {tradeType === "buy" && (
                <div className="flex justify-between text-[13px]">
                  <span className="text-muted-foreground">Available cash</span>
                  <span className={`font-semibold ${canBuy ? "text-foreground" : "text-loss"}`}>
                    {formatCurrency(portfolio.cashBalance)}
                  </span>
                </div>
              )}
              {tradeType === "sell" && holding && (
                <div className="flex justify-between text-[13px]">
                  <span className="text-muted-foreground">Shares owned</span>
                  <span className={`font-semibold ${canSell ? "text-foreground" : "text-loss"}`}>
                    {holding.shares}
                  </span>
                </div>
              )}
            </div>

            {/* Diversification warning */}
            {showDiversificationWarning && (
              <div className="flex gap-2 p-3 rounded-lg bg-amber-400/10 border border-amber-400/20 mb-4">
                <AlertTriangle size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-[12px] text-amber-400 leading-snug">
                  This would put {singleStockPct.toFixed(1)}% of your portfolio in one stock.
                  Consider diversifying.
                </p>
              </div>
            )}

            {tradeMsg && (
              <div
                className={`p-3 rounded-lg text-[12px] mb-4 ${
                  tradeMsg.type === "success"
                    ? "bg-gain/10 text-gain border border-gain/20"
                    : "bg-loss/10 text-loss border border-loss/20"
                }`}
              >
                {tradeMsg.text}
              </div>
            )}

            <button
              onClick={handleTrade}
              disabled={isLoading || (tradeType === "buy" ? !canBuy : !canSell)}
              className={`w-full py-2.5 rounded-lg font-semibold text-[13px] transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-white ${
                tradeType === "buy"
                  ? "bg-gain hover:bg-gain/90"
                  : "bg-loss hover:bg-loss/90"
              }`}
            >
              {isLoading
                ? "Processing…"
                : tradeType === "buy"
                ? `Buy ${quantity} share${quantity > 1 ? "s" : ""}`
                : `Sell ${quantity} share${quantity > 1 ? "s" : ""}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
