"use client";

import { usePortfolioStore } from "@/stores/portfolio.store";
import { useAuthStore } from "@/stores/auth.store";
import { formatCurrency, formatPercent } from "@/utils/format";
import { cn } from "@/lib/utils";

const MOCK_TRADERS = [
  { username: "quantking", value: 184_230, returnPct: 84.23, trades: 67 },
  { username: "bullrunner", value: 162_810, returnPct: 62.81, trades: 45 },
  { username: "techbull_x", value: 151_440, returnPct: 51.44, trades: 38 },
  { username: "valueseeker", value: 138_920, returnPct: 38.92, trades: 29 },
  { username: "dividendhero", value: 127_650, returnPct: 27.65, trades: 22 },
  { username: "swingtrader7", value: 119_480, returnPct: 19.48, trades: 55 },
  { username: "hodlmaster", value: 114_220, returnPct: 14.22, trades: 8 },
  { username: "alphaseeking", value: 108_340, returnPct: 8.34, trades: 31 },
  { username: "riskoff2024", value: 103_110, returnPct: 3.11, trades: 14 },
  { username: "patient_panda", value: 100_450, returnPct: 0.45, trades: 3 },
];

const RANK_LABEL = ["1st", "2nd", "3rd"];

export default function LeaderboardsPage() {
  const { portfolio, transactions } = usePortfolioStore();
  const { user } = useAuthStore();

  const userEntry = {
    username: user?.username ?? "you",
    value: portfolio.totalValue,
    returnPct: ((portfolio.totalValue - 100_000) / 100_000) * 100,
    trades: transactions.length,
    isUser: true,
  };

  const allTraders = [
    ...MOCK_TRADERS.map((t) => ({ ...t, isUser: false })),
    userEntry,
  ]
    .sort((a, b) => b.value - a.value)
    .map((t, i) => ({ ...t, rank: i + 1 }));

  const top3 = allTraders.slice(0, 3);
  const rest = allTraders.slice(3);
  const userRank = allTraders.find((t) => t.isUser)?.rank ?? 0;

  return (
    <div className="space-y-5">
      {/* Your rank summary */}
      <div className="bg-card border border-border rounded-xl px-5 py-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center font-bold text-primary-foreground font-mono text-sm flex-shrink-0">
          #{userRank}
        </div>
        <div className="flex-1">
          <p className="text-[13px] font-semibold text-foreground">Your ranking</p>
          <p className="text-[11px] text-muted-foreground">
            {userRank <= 3
              ? "You're in the top 3 — outstanding performance!"
              : `${userRank - 1} trader${userRank - 1 !== 1 ? "s" : ""} ahead of you`}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[13px] font-bold font-mono text-foreground">{formatCurrency(portfolio.totalValue)}</p>
          <p className={cn("text-[11px] font-mono", userEntry.returnPct >= 0 ? "text-gain" : "text-loss")}>
            {formatPercent(userEntry.returnPct)}
          </p>
        </div>
      </div>

      {/* Top 3 podium */}
      <div className="grid grid-cols-3 gap-3">
        {top3.map((trader) => (
          <div
            key={trader.username}
            className={cn(
              "bg-card border rounded-xl p-4 text-center",
              trader.isUser ? "border-primary/50" : "border-border"
            )}
          >
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
              {RANK_LABEL[trader.rank - 1]}
            </p>
            <div
              className={cn(
                "w-10 h-10 rounded-md mx-auto mb-2 flex items-center justify-center font-bold text-sm",
                trader.isUser
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-foreground"
              )}
            >
              {trader.username[0].toUpperCase()}
            </div>
            <p className={cn("text-[12px] font-semibold truncate", trader.isUser && "text-primary")}>
              {trader.isUser ? "You" : trader.username}
            </p>
            <p className="text-[13px] font-bold font-mono mt-1">{formatCurrency(trader.value)}</p>
            <p className={cn("text-[11px] font-mono mt-0.5", trader.returnPct >= 0 ? "text-gain" : "text-loss")}>
              {formatPercent(trader.returnPct)}
            </p>
          </div>
        ))}
      </div>

      {/* Full table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-5 py-3 text-[10px] uppercase tracking-widest text-muted-foreground font-medium w-12">
                Rank
              </th>
              <th className="text-left px-3 py-3 text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                Trader
              </th>
              <th className="text-right px-3 py-3 text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                Value
              </th>
              <th className="text-right px-3 py-3 text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                Return
              </th>
              <th className="text-right px-5 py-3 text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                Trades
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {allTraders.map((trader) => (
              <tr
                key={trader.username}
                className={cn(
                  "transition-colors",
                  trader.isUser ? "bg-primary/5" : "hover:bg-secondary/40"
                )}
              >
                <td className="px-5 py-3 font-mono text-muted-foreground text-[12px]">
                  {trader.rank}
                </td>
                <td className="px-3 py-3">
                  <span className={cn("font-semibold", trader.isUser ? "text-primary" : "text-foreground")}>
                    {trader.isUser ? "You" : trader.username}
                  </span>
                </td>
                <td className="px-3 py-3 text-right font-mono font-semibold text-foreground">
                  {formatCurrency(trader.value)}
                </td>
                <td className={cn("px-3 py-3 text-right font-mono text-[12px]", trader.returnPct >= 0 ? "text-gain" : "text-loss")}>
                  {formatPercent(trader.returnPct)}
                </td>
                <td className="px-5 py-3 text-right text-muted-foreground font-mono text-[12px]">
                  {trader.trades}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
