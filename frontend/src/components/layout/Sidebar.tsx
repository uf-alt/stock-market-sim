"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  TrendingUp,
  BriefcaseBusiness,
  Bookmark,
  Activity,
  BookOpen,
  Trophy,
  Users,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { usePortfolioStore } from "@/stores/portfolio.store";
import { formatCurrency } from "@/utils/format";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/markets", label: "Markets", icon: TrendingUp },
  { href: "/portfolio", label: "Portfolio", icon: BriefcaseBusiness },
  { href: "/watchlist", label: "Watchlist", icon: Bookmark },
  { href: "/backtesting", label: "Backtest", icon: Activity },
];

const LEARN_ITEMS = [
  { href: "/learn", label: "Learn", icon: BookOpen },
  { href: "/achievements", label: "Achievements", icon: Trophy },
  { href: "/leaderboards", label: "Leaderboard", icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { portfolio } = usePortfolioStore();

  const xpPct = user ? Math.round((user.xp / user.xpToNext) * 100) : 0;

  return (
    <aside className="w-[220px] h-screen bg-card border-r border-border flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-[18px] py-[18px] border-b border-border">
        <span className="w-7 h-7 rounded-md border border-primary/40 flex items-center justify-center font-black text-[13px] text-primary flex-shrink-0">
          S
        </span>
        <span className="font-semibold text-[15px] tracking-tight text-foreground">StockSim</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2.5 py-3 flex flex-col gap-0.5 overflow-y-auto">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 px-2 py-2.5 mt-1">
          Trading
        </p>
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2.5 px-3 py-[8px] rounded-md text-[13px] font-medium transition-colors",
              pathname === href
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
            )}
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}

        <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 px-2 py-2.5 mt-3">
          Learn
        </p>
        {LEARN_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2.5 px-3 py-[8px] rounded-md text-[13px] font-medium transition-colors",
              pathname === href
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
            )}
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
      </nav>

      {/* Balance chip */}
      <div className="mx-3 mb-3 px-3 py-2.5 rounded-md border border-border">
        <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-0.5">
          Cash
        </p>
        <p className="text-sm font-bold text-foreground font-mono">
          {formatCurrency(portfolio.cashBalance)}
        </p>
      </div>

      {/* User footer */}
      <div className="p-3.5 border-t border-border">
        <div className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg hover:bg-secondary transition-colors cursor-pointer group">
          <div className="w-[34px] h-[34px] rounded-md bg-primary flex items-center justify-center font-bold text-[13px] text-primary-foreground flex-shrink-0">
            {user?.username?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-foreground truncate">
              {user?.username ?? "Guest"}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="h-1 flex-1 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${xpPct}%` }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                Lv {user?.level ?? 1}
              </span>
            </div>
          </div>
          <button
            onClick={logout}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
            title="Log out"
          >
            <LogOut size={14} />
          </button>
        </div>
        <Link
          href="/settings"
          className="flex items-center gap-2.5 px-3 py-2 mt-1 rounded-lg text-[13px] text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
          <Settings size={14} />
          Settings
        </Link>
      </div>
    </aside>
  );
}
