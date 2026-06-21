"use client";

import {
  ShoppingCart,
  ArrowUpDown,
  DollarSign,
  PieChart,
  Layers,
  Zap,
  Banknote,
  Sprout,
  TrendingUp,
  Eye,
  Activity,
  LayoutGrid,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { usePortfolioStore } from "@/stores/portfolio.store";
import { useMarketStore } from "@/stores/market.store";
import { cn } from "@/lib/utils";
import type { Portfolio, Transaction } from "@/types";
import type { Stock } from "@/types";

interface AchCtx {
  portfolio: Portfolio;
  transactions: Transaction[];
  watchlist: string[];
  stocks: Stock[];
}

const ACHIEVEMENTS: {
  id: string;
  title: string;
  description: string;
  xp: number;
  icon: React.ElementType;
  check: (ctx: AchCtx) => boolean;
}[] = [
  {
    id: "first-trade",
    title: "First Trade",
    description: "Execute your first buy order",
    xp: 50,
    icon: ShoppingCart,
    check: (ctx) => ctx.transactions.length >= 1,
  },
  {
    id: "first-sell",
    title: "First Exit",
    description: "Close your first position with a sell",
    xp: 75,
    icon: ArrowUpDown,
    check: (ctx) => ctx.transactions.some((t) => t.type === "sell"),
  },
  {
    id: "first-win",
    title: "In the Green",
    description: "Earn a positive realized gain",
    xp: 100,
    icon: DollarSign,
    check: (ctx) => ctx.portfolio.realizedGain > 0,
  },
  {
    id: "diversified",
    title: "Diversified",
    description: "Hold 3 or more stocks at once",
    xp: 100,
    icon: PieChart,
    check: (ctx) => ctx.portfolio.holdings.length >= 3,
  },
  {
    id: "portfolio-builder",
    title: "Portfolio Builder",
    description: "Hold 5 or more stocks simultaneously",
    xp: 150,
    icon: Layers,
    check: (ctx) => ctx.portfolio.holdings.length >= 5,
  },
  {
    id: "active-trader",
    title: "Active Trader",
    description: "Execute 10 or more trades total",
    xp: 100,
    icon: Zap,
    check: (ctx) => ctx.transactions.length >= 10,
  },
  {
    id: "big-spender",
    title: "Big Spender",
    description: "Execute a single trade worth $10,000 or more",
    xp: 75,
    icon: Banknote,
    check: (ctx) => ctx.transactions.some((t) => t.total >= 10_000),
  },
  {
    id: "growing",
    title: "Growing",
    description: "Grow your portfolio to $110,000 (10% return)",
    xp: 100,
    icon: Sprout,
    check: (ctx) => ctx.portfolio.totalValue >= 110_000,
  },
  {
    id: "bull-run",
    title: "Bull Run",
    description: "Reach a portfolio value of $120,000",
    xp: 200,
    icon: TrendingUp,
    check: (ctx) => ctx.portfolio.totalValue >= 120_000,
  },
  {
    id: "watcher",
    title: "On Watch",
    description: "Add 3 or more stocks to your watchlist",
    xp: 50,
    icon: Eye,
    check: (ctx) => ctx.watchlist.length >= 3,
  },
  {
    id: "marathon",
    title: "Marathon Runner",
    description: "Execute 25 or more trades",
    xp: 200,
    icon: Activity,
    check: (ctx) => ctx.transactions.length >= 25,
  },
  {
    id: "sector-pro",
    title: "Sector Pro",
    description: "Hold stocks across 3 or more different sectors",
    xp: 150,
    icon: LayoutGrid,
    check: (ctx) => {
      const tickers = new Set(ctx.portfolio.holdings.map((h) => h.ticker));
      const sectors = new Set(
        ctx.stocks.filter((s) => tickers.has(s.ticker)).map((s) => s.sector)
      );
      return sectors.size >= 3;
    },
  },
];

export default function AchievementsPage() {
  const { portfolio, transactions } = usePortfolioStore();
  const { watchlist, stocks } = useMarketStore();

  const ctx: AchCtx = { portfolio, transactions, watchlist, stocks };

  const unlocked = ACHIEVEMENTS.filter((a) => a.check(ctx));
  const totalXp = unlocked.reduce((s, a) => s + a.xp, 0);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Unlocked</p>
          <p className="text-2xl font-bold font-mono">
            {unlocked.length}
            <span className="text-sm text-muted-foreground font-normal ml-1">/ {ACHIEVEMENTS.length}</span>
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">XP Earned</p>
          <p className="text-2xl font-bold font-mono">{totalXp.toLocaleString()}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Completion</p>
          <p className="text-2xl font-bold font-mono">
            {Math.round((unlocked.length / ACHIEVEMENTS.length) * 100)}%
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-border rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all"
          style={{ width: `${(unlocked.length / ACHIEVEMENTS.length) * 100}%` }}
        />
      </div>

      {/* Achievement grid */}
      <div className="grid grid-cols-2 gap-3">
        {ACHIEVEMENTS.map((achievement) => {
          const isUnlocked = achievement.check(ctx);
          const Icon = achievement.icon;
          return (
            <div
              key={achievement.id}
              className={cn(
                "bg-card border rounded-xl p-4 transition-opacity",
                isUnlocked ? "border-border" : "border-border opacity-50"
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0",
                    isUnlocked ? "bg-primary/10" : "bg-secondary"
                  )}
                >
                  {isUnlocked ? (
                    <Icon size={16} className="text-primary" />
                  ) : (
                    <Lock size={14} className="text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-foreground leading-tight">
                    {achievement.title}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                    {achievement.description}
                  </p>
                  <p
                    className={cn(
                      "text-[10px] mt-1.5 font-mono font-semibold",
                      isUnlocked ? "text-gain" : "text-muted-foreground"
                    )}
                  >
                    +{achievement.xp} XP
                  </p>
                </div>
                {isUnlocked && (
                  <CheckCircle2 size={14} className="text-gain flex-shrink-0 mt-0.5" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
