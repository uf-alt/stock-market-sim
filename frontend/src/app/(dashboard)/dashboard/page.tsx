"use client";

import Link from "next/link";
import { usePortfolioStore } from "@/stores/portfolio.store";
import { useAuthStore } from "@/stores/auth.store";
import { useMarketStore } from "@/stores/market.store";
import { formatCurrency, formatPercent, formatChange } from "@/utils/format";
import { MARKET_INDICES } from "@/lib/mock-data";
import {
  TrendingUp,
  TrendingDown,
  Flame,
  Zap,
  ChevronRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  YAxis,
} from "recharts";

// Mini sparkline data
const sparkData = [100, 105, 102, 108, 106, 112, 110, 115, 118, 122, 119, 125];

function StatCard({
  label,
  value,
  sub,
  positive,
}: {
  label: string;
  value: string;
  sub?: string;
  positive?: boolean;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
        {label}
      </p>
      <p className="text-2xl font-bold tracking-tight font-mono">
        {value}
      </p>
      {sub && (
        <p
          className={`text-[13px] font-semibold mt-1 ${
            positive === undefined
              ? "text-muted-foreground"
              : positive
              ? "text-gain"
              : "text-loss"
          }`}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { portfolio, transactions } = usePortfolioStore();
  const { user } = useAuthStore();
  const { stocks } = useMarketStore();

  const xpPct = user ? Math.round((user.xp / user.xpToNext) * 100) : 0;
  const gainers = [...stocks]
    .filter((s) => s.changePct > 0)
    .sort((a, b) => b.changePct - a.changePct)
    .slice(0, 4);
  const losers = [...stocks]
    .filter((s) => s.changePct < 0)
    .sort((a, b) => a.changePct - b.changePct)
    .slice(0, 4);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Row 1 — Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Portfolio Value"
          value={formatCurrency(portfolio.totalValue)}
          sub={`${formatChange(portfolio.dailyChange)} today`}
          positive={portfolio.dailyChange >= 0}
        />
        <StatCard
          label="Total Return"
          value={formatPercent(portfolio.unrealizedGainPct)}
          sub={formatChange(portfolio.unrealizedGain)}
          positive={portfolio.unrealizedGain >= 0}
        />
        <StatCard
          label="Cash Balance"
          value={formatCurrency(portfolio.cashBalance)}
          sub={`${((portfolio.cashBalance / portfolio.totalValue) * 100).toFixed(1)}% of portfolio`}
        />
        <StatCard
          label="Realized Gains"
          value={formatCurrency(portfolio.realizedGain)}
          positive={portfolio.realizedGain >= 0}
        />
      </div>

      {/* Row 2 — Chart + XP */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Sparkline */}
        <div className="md:col-span-2 bg-card border border-border rounded-xl p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Portfolio Performance
              </p>
              <p className="text-3xl font-bold mt-1 tracking-tight font-mono">
                {formatCurrency(portfolio.totalValue)}
              </p>
              <p className="text-[13px] font-semibold text-gain mt-0.5">
                {formatChange(portfolio.dailyChange)} ({formatPercent(portfolio.dailyChangePct)}) today
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={sparkData.map((v, i) => ({ i, v }))}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#c96520" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#c96520" stopOpacity={0} />
                </linearGradient>
              </defs>
              <YAxis domain={["dataMin - 5", "dataMax + 5"]} hide />
              <Tooltip
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "var(--foreground)",
                }}
                formatter={(v) => [`$${Number(v).toFixed(2)}`, ""]}
              />
              <Area
                type="monotone"
                dataKey="v"
                stroke="#c96520"
                strokeWidth={2}
                fill="url(#grad)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* XP + Streak */}
        <div className="flex flex-col gap-4">
          <div className="bg-card border border-border rounded-xl p-5 flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={15} className="text-amber-400" />
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Level {user?.level}
              </p>
            </div>
            <p className="text-3xl font-bold tracking-tight mb-3 font-mono">
              {user?.xp.toLocaleString()} XP
            </p>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${xpPct}%` }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground mt-1.5">
              {user?.xpToNext ? user.xpToNext - user.xp : 0} XP to Level {(user?.level ?? 1) + 1}
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Flame size={15} className="text-primary" />
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Daily Streak
              </p>
            </div>
            <p className="text-3xl font-bold tracking-tight font-mono">
              {user?.streak ?? 0}
            </p>
            <p className="text-[12px] text-muted-foreground mt-0.5">days in a row</p>
          </div>
        </div>
      </div>

      {/* Row 3 — Market indices */}
      <div>
        <p className="text-[12px] uppercase tracking-wider text-muted-foreground font-semibold mb-3">
          Market Overview
        </p>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {MARKET_INDICES.map((idx) => (
            <div
              key={idx.symbol}
              className="bg-card border border-border rounded-lg px-4 py-3 flex-shrink-0 min-w-[150px]"
            >
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">
                {idx.name}
              </p>
              <p className="text-lg font-bold tracking-tight font-mono">
                {idx.value.toLocaleString()}
              </p>
              <p
                className={`text-[12px] font-semibold mt-0.5 ${
                  idx.changePct >= 0 ? "text-gain" : "text-loss"
                }`}
              >
                {formatPercent(idx.changePct)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Row 4 — Holdings + Movers */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Holdings */}
        <div>
          <div className="flex items-center justify-between pb-3.5">
            <p className="text-[12px] uppercase tracking-wider text-muted-foreground font-semibold">
              Top Holdings
            </p>
            <Link
              href="/portfolio"
              className="text-[12px] font-semibold text-primary flex items-center gap-0.5 hover:underline"
            >
              View all <ChevronRight size={12} />
            </Link>
          </div>
          {portfolio.holdings.length === 0 ? (
            <p className="text-[13px] text-muted-foreground py-4">
              Start building your portfolio by purchasing your first stock.
            </p>
          ) : (
            <div className="space-y-1">
              {portfolio.holdings.slice(0, 5).map((h) => (
                <Link
                  key={h.ticker}
                  href={`/stock/${h.ticker}`}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-primary/5 transition-colors"
                >
                  <span className="w-8 h-8 rounded-md bg-secondary border border-border flex items-center justify-center text-[9px] font-black text-muted-foreground flex-shrink-0">
                    {h.ticker.slice(0, 2)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-foreground">{h.ticker}</p>
                    <p className="text-[11px] text-muted-foreground">{h.shares} shares</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[13px] font-semibold">{formatCurrency(h.totalValue)}</p>
                    <p className={`text-[11px] font-semibold ${h.unrealizedGainPct >= 0 ? "text-gain" : "text-loss"}`}>
                      {formatPercent(h.unrealizedGainPct)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Market movers */}
        <div>
          <div className="flex items-center justify-between pb-3.5">
            <p className="text-[12px] uppercase tracking-wider text-muted-foreground font-semibold">
              Market Movers
            </p>
            <Link
              href="/markets"
              className="text-[12px] font-semibold text-primary flex items-center gap-0.5 hover:underline"
            >
              Markets <ChevronRight size={12} />
            </Link>
          </div>
          <div className="space-y-1">
            {gainers.slice(0, 3).map((s) => (
              <Link
                key={s.ticker}
                href={`/stock/${s.ticker}`}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-primary/5 transition-colors"
              >
                <TrendingUp size={14} className="text-gain flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-[13px] font-bold">{s.ticker}</p>
                  <p className="text-[11px] text-muted-foreground">{s.name}</p>
                </div>
                <span className="text-[12px] font-semibold text-gain">
                  {formatPercent(s.changePct)}
                </span>
              </Link>
            ))}
            <div className="border-t border-border my-1" />
            {losers.slice(0, 3).map((s) => (
              <Link
                key={s.ticker}
                href={`/stock/${s.ticker}`}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-primary/5 transition-colors"
              >
                <TrendingDown size={14} className="text-loss flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-[13px] font-bold">{s.ticker}</p>
                  <p className="text-[11px] text-muted-foreground">{s.name}</p>
                </div>
                <span className="text-[12px] font-semibold text-loss">
                  {formatPercent(s.changePct)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Row 5 — Recent transactions */}
      <div>
        <div className="flex items-center justify-between pb-3.5">
          <p className="text-[12px] uppercase tracking-wider text-muted-foreground font-semibold">
            Recent Transactions
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr>
                <th className="text-[10px] uppercase tracking-wider text-muted-foreground/70 py-2.5 px-4 font-semibold border-y border-border bg-transparent text-left">Type</th>
                <th className="text-[10px] uppercase tracking-wider text-muted-foreground/70 py-2.5 px-4 font-semibold border-y border-border bg-transparent text-left">Stock</th>
                <th className="text-[10px] uppercase tracking-wider text-muted-foreground/70 py-2.5 px-4 font-semibold border-y border-border bg-transparent text-right">Shares</th>
                <th className="text-[10px] uppercase tracking-wider text-muted-foreground/70 py-2.5 px-4 font-semibold border-y border-border bg-transparent text-right">Price</th>
                <th className="text-[10px] uppercase tracking-wider text-muted-foreground/70 py-2.5 px-4 font-semibold border-y border-border bg-transparent text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 5).map((tx, i) => (
                <tr key={tx.id} className="group hover:bg-primary/5 transition-colors">
                  <td className={`py-2.5 px-4 ${i > 0 ? "border-t border-border" : ""}`}>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        tx.type === "buy"
                          ? "bg-gain/10 text-gain"
                          : "bg-loss/10 text-loss"
                      }`}
                    >
                      {tx.type}
                    </span>
                  </td>
                  <td className={`py-2.5 px-4 font-semibold ${i > 0 ? "border-t border-border" : ""}`}>{tx.ticker}</td>
                  <td className={`py-2.5 px-4 text-right text-muted-foreground ${i > 0 ? "border-t border-border" : ""}`}>{tx.shares}</td>
                  <td className={`py-2.5 px-4 text-right ${i > 0 ? "border-t border-border" : ""}`}>{formatCurrency(tx.price)}</td>
                  <td className={`py-2.5 px-4 text-right font-semibold ${i > 0 ? "border-t border-border" : ""}`}>{formatCurrency(tx.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
