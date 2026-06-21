"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { useAuthStore } from "@/stores/auth.store";
import { useMarketStore } from "@/stores/market.store";
import { usePortfolioStore } from "@/stores/portfolio.store";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/markets": "Markets",
  "/portfolio": "Portfolio",
  "/watchlist": "Watchlist",
  "/learn": "Learn",
  "/achievements": "Achievements",
  "/leaderboards": "Leaderboard",
  "/settings": "Settings",
  "/backtesting": "Backtest",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, init } = useAuthStore();
  const { fetchStocks, fetchWatchlist, stocks } = useMarketStore();
  const { syncPrices, fetchPortfolio } = usePortfolioStore();
  const router = useRouter();
  const pathname = usePathname();

  // Prevent redirect flash while persist rehydrates on first render
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    init().finally(() => setInitialized(true));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!initialized) return;
    if (!isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, initialized, pathname, router]);

  // Load all data once authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchStocks();
    fetchPortfolio();
    fetchWatchlist();
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep portfolio P&L current whenever prices refresh
  useEffect(() => {
    syncPrices(stocks);
  }, [stocks]); // eslint-disable-line react-hooks/exhaustive-deps

  const title =
    Object.entries(PAGE_TITLES).find(([path]) =>
      pathname.startsWith(path)
    )?.[1] ?? "StockSim";

  if (!initialized || !isAuthenticated) return null;

  return <AppShell title={title}>{children}</AppShell>;
}
