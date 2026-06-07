"use client";

import Link from "next/link";
import { usePortfolioStore } from "@/stores/portfolio.store";
import { formatCurrency, formatPercent, formatChange, formatDateTime } from "@/utils/format";
import { getSectorColor } from "@/lib/mock-data";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function PortfolioPage() {
  const { portfolio, transactions } = usePortfolioStore();

  const pieData = portfolio.holdings.map((h) => ({
    name: h.ticker,
    value: parseFloat(h.totalValue.toFixed(2)),
    color: getSectorColor("Technology"),
  }));

  const COLORS = [
    "#c96520", "#0ecb81", "#3b82f6", "#a855f7",
    "#f0b90b", "#f6465d", "#06b6d4", "#84cc16",
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Value", value: formatCurrency(portfolio.totalValue), sub: `${formatPercent(portfolio.unrealizedGainPct)} all time`, pos: portfolio.unrealizedGain >= 0 },
          { label: "Unrealized P&L", value: formatChange(portfolio.unrealizedGain), sub: formatPercent(portfolio.unrealizedGainPct), pos: portfolio.unrealizedGain >= 0 },
          { label: "Realized Gains", value: formatChange(portfolio.realizedGain), sub: "closed positions", pos: portfolio.realizedGain >= 0 },
          { label: "Cash Balance", value: formatCurrency(portfolio.cashBalance), sub: `${((portfolio.cashBalance / portfolio.totalValue) * 100).toFixed(1)}% of portfolio`, pos: undefined },
        ].map(({ label, value, sub, pos }) => (
          <div key={label} className="bg-card border border-border rounded-2xl p-5">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">{label}</p>
            <p
              className={`text-2xl font-black tracking-tight ${
                pos === undefined ? "text-foreground" : pos ? "text-gain" : "text-loss"
              }`}
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              {value}
            </p>
            <p className={`text-[12px] mt-0.5 ${pos === undefined ? "text-muted-foreground" : pos ? "text-gain/80" : "text-loss/80"}`}>
              {sub}
            </p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Holdings table */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between pb-3.5">
            <p className="text-[12px] uppercase tracking-wider text-muted-foreground font-semibold">
              Holdings
            </p>
          </div>
          {portfolio.holdings.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground text-[14px] mb-3">No holdings yet.</p>
              <Link
                href="/markets"
                className="text-primary font-semibold text-[13px] hover:underline"
              >
                Browse markets →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px] border-collapse">
                <thead>
                  <tr>
                    {["Stock", "Shares", "Avg Cost", "Current", "Value", "P&L", "Alloc", ""].map((h, i) => (
                      <th
                        key={h + i}
                        className={`text-[10px] uppercase tracking-wider text-muted-foreground/70 py-2.5 px-4 font-semibold border-y border-border bg-transparent ${i === 0 ? "text-left" : "text-right"}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {portfolio.holdings.map((h, i) => (
                    <tr key={h.ticker} className="group hover:bg-primary/5 transition-colors">
                      <td className={`py-3 px-4 ${i > 0 ? "border-t border-border" : ""}`}>
                        <div className="flex items-center gap-2.5">
                          <span className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center text-[9px] font-black text-muted-foreground flex-shrink-0">
                            {h.ticker.slice(0, 2)}
                          </span>
                          <div>
                            <Link
                              href={`/stock/${h.ticker}`}
                              className="font-bold hover:text-primary transition-colors"
                            >
                              {h.ticker}
                            </Link>
                            <p className="text-[11px] text-muted-foreground truncate max-w-[100px]">
                              {h.name}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className={`py-3 px-4 text-right text-muted-foreground ${i > 0 ? "border-t border-border" : ""}`}>{h.shares}</td>
                      <td className={`py-3 px-4 text-right ${i > 0 ? "border-t border-border" : ""}`}>{formatCurrency(h.avgCost)}</td>
                      <td className={`py-3 px-4 text-right font-semibold ${i > 0 ? "border-t border-border" : ""}`}>{formatCurrency(h.currentPrice)}</td>
                      <td className={`py-3 px-4 text-right font-semibold ${i > 0 ? "border-t border-border" : ""}`}>{formatCurrency(h.totalValue)}</td>
                      <td className={`py-3 px-4 text-right ${i > 0 ? "border-t border-border" : ""}`}>
                        <span className={`font-semibold ${h.unrealizedGain >= 0 ? "text-gain" : "text-loss"}`}>
                          {formatChange(h.unrealizedGain)}
                        </span>
                        <br />
                        <span className={`text-[11px] ${h.unrealizedGain >= 0 ? "text-gain/70" : "text-loss/70"}`}>
                          {formatPercent(h.unrealizedGainPct)}
                        </span>
                      </td>
                      <td className={`py-3 px-4 text-right text-muted-foreground ${i > 0 ? "border-t border-border" : ""}`}>
                        {h.allocation.toFixed(1)}%
                      </td>
                      <td className={`py-3 px-4 text-right ${i > 0 ? "border-t border-border" : ""}`}>
                        <Link
                          href={`/stock/${h.ticker}`}
                          className="text-[12px] font-semibold text-primary hover:underline"
                        >
                          Trade →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Allocation chart */}
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-2xl p-5">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-4">
              Allocation
            </p>
            {pieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "var(--popover)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                        fontSize: "12px",
                        color: "var(--foreground)",
                      }}
                      formatter={(v) => [formatCurrency(Number(v)), ""]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-2">
                  {portfolio.holdings.slice(0, 6).map((h, i) => (
                    <div key={h.ticker} className="flex items-center gap-2 text-[12px]">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ background: COLORS[i % COLORS.length] }}
                      />
                      <span className="font-semibold text-foreground">{h.ticker}</span>
                      <div
                        className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden"
                        style={{ minWidth: 0 }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${h.allocation.toFixed(1)}%`,
                            background: COLORS[i % COLORS.length],
                          }}
                        />
                      </div>
                      <span className="text-muted-foreground ml-auto pl-2 w-10 text-right">
                        {h.allocation.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-muted-foreground text-[13px]">No holdings yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Transaction history */}
      <div>
        <div className="flex items-center justify-between pb-3.5">
          <p className="text-[12px] uppercase tracking-wider text-muted-foreground font-semibold">
            Transaction History
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] border-collapse">
            <thead>
              <tr>
                {["Date", "Type", "Stock", "Shares", "Price", "Total"].map((h, i) => (
                  <th
                    key={h}
                    className={`text-[10px] uppercase tracking-wider text-muted-foreground/70 py-2.5 px-4 font-semibold border-y border-border bg-transparent ${i === 0 || i === 2 ? "text-left" : "text-right"}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx, i) => (
                <tr key={tx.id} className="group hover:bg-primary/5 transition-colors">
                  <td className={`py-3 px-4 text-muted-foreground whitespace-nowrap ${i > 0 ? "border-t border-border" : ""}`}>
                    {formatDateTime(tx.timestamp)}
                  </td>
                  <td className={`py-3 px-4 ${i > 0 ? "border-t border-border" : ""}`}>
                    <span
                      className={`flex items-center gap-1 text-[11px] font-semibold uppercase ${
                        tx.type === "buy" ? "text-gain" : "text-loss"
                      }`}
                    >
                      {tx.type === "buy" ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                      {tx.type}
                    </span>
                  </td>
                  <td className={`py-3 px-4 font-bold ${i > 0 ? "border-t border-border" : ""}`}>{tx.ticker}</td>
                  <td className={`py-3 px-4 text-right text-muted-foreground ${i > 0 ? "border-t border-border" : ""}`}>{tx.shares}</td>
                  <td className={`py-3 px-4 text-right ${i > 0 ? "border-t border-border" : ""}`}>{formatCurrency(tx.price)}</td>
                  <td className={`py-3 px-4 text-right font-semibold ${i > 0 ? "border-t border-border" : ""}`}>{formatCurrency(tx.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
