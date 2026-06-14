import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Portfolio, Transaction, Holding } from "@/types";
import { STOCKS } from "@/lib/mock-data";

const EMPTY_PORTFOLIO: Portfolio = {
  id: "local",
  cashBalance: 100_000,
  totalValue: 100_000,
  totalCost: 0,
  unrealizedGain: 0,
  unrealizedGainPct: 0,
  realizedGain: 0,
  dailyChange: 0,
  dailyChangePct: 0,
  holdings: [],
};

interface PortfolioState {
  portfolio: Portfolio;
  transactions: Transaction[];
  isLoading: boolean;
  executeTrade: (
    ticker: string,
    shares: number,
    type: "buy" | "sell",
    price: number
  ) => Promise<{ success: boolean; error?: string }>;
  fetchPortfolio: () => Promise<void>;
  fetchTransactions: () => Promise<void>;
  syncPrices: (stocks: { ticker: string; price: number; name: string }[]) => void;
}

function nameFor(ticker: string) {
  return STOCKS.find((s) => s.ticker === ticker)?.name ?? ticker;
}

function recomputeTotals(portfolio: Portfolio): Portfolio {
  const holdingsValue = portfolio.holdings.reduce((s, h) => s + h.totalValue, 0);
  const totalCost = portfolio.holdings.reduce((s, h) => s + h.totalCost, 0);
  const totalValue = portfolio.cashBalance + holdingsValue;
  const unrealizedGain = holdingsValue - totalCost;
  const unrealizedGainPct = totalCost > 0 ? (unrealizedGain / totalCost) * 100 : 0;
  return { ...portfolio, totalValue, totalCost, unrealizedGain, unrealizedGainPct };
}

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set, get) => ({
      portfolio: EMPTY_PORTFOLIO,
      transactions: [],
      isLoading: false,

      fetchPortfolio: async () => {
        // no-op — portfolio lives in localStorage via persist
      },

      fetchTransactions: async () => {
        // no-op — transactions live in localStorage via persist
      },

      syncPrices: (stocks) => {
        const { portfolio } = get();
        const holdings = portfolio.holdings.map((h) => {
          const live = stocks.find((s) => s.ticker === h.ticker);
          if (!live) return h;
          const totalValue = live.price * h.shares;
          const unrealizedGain = totalValue - h.totalCost;
          const unrealizedGainPct = h.totalCost > 0 ? (unrealizedGain / h.totalCost) * 100 : 0;
          return { ...h, currentPrice: live.price, totalValue, unrealizedGain, unrealizedGainPct };
        });
        set({ portfolio: recomputeTotals({ ...portfolio, holdings }) });
      },

      executeTrade: async (ticker, shares, type, price) => {
        const { portfolio, transactions } = get();
        set({ isLoading: true });

        try {
          if (type === "buy") {
            const cost = price * shares;
            if (portfolio.cashBalance < cost) {
              return { success: false, error: "Insufficient cash" };
            }

            const existing = portfolio.holdings.find((h) => h.ticker === ticker);
            let holdings: Holding[];

            if (existing) {
              const newShares = existing.shares + shares;
              const newTotalCost = existing.totalCost + cost;
              const newAvgCost = newTotalCost / newShares;
              const totalValue = price * newShares;
              const unrealizedGain = totalValue - newTotalCost;
              const unrealizedGainPct = (unrealizedGain / newTotalCost) * 100;
              holdings = portfolio.holdings.map((h) =>
                h.ticker === ticker
                  ? {
                      ...h,
                      shares: newShares,
                      avgCost: newAvgCost,
                      totalCost: newTotalCost,
                      totalValue,
                      unrealizedGain,
                      unrealizedGainPct,
                      currentPrice: price,
                    }
                  : h
              );
            } else {
              const newHolding: Holding = {
                ticker,
                name: nameFor(ticker),
                shares,
                avgCost: price,
                currentPrice: price,
                totalValue: price * shares,
                totalCost: cost,
                unrealizedGain: 0,
                unrealizedGainPct: 0,
                allocation: 0,
              };
              holdings = [...portfolio.holdings, newHolding];
            }

            const newPortfolio = recomputeTotals({
              ...portfolio,
              cashBalance: portfolio.cashBalance - cost,
              holdings,
            });

            const tx: Transaction = {
              id: `tx-${Date.now()}`,
              type: "buy",
              ticker,
              name: nameFor(ticker),
              shares,
              price,
              total: cost,
              timestamp: new Date().toISOString(),
            };

            set({ portfolio: newPortfolio, transactions: [tx, ...transactions] });
            return { success: true };
          } else {
            const existing = portfolio.holdings.find((h) => h.ticker === ticker);
            if (!existing || existing.shares < shares) {
              return { success: false, error: "Insufficient shares" };
            }

            const proceeds = price * shares;
            const costBasis = existing.avgCost * shares;
            const realizedGain = proceeds - costBasis;

            let holdings: Holding[];
            if (existing.shares === shares) {
              holdings = portfolio.holdings.filter((h) => h.ticker !== ticker);
            } else {
              const newShares = existing.shares - shares;
              const newTotalCost = existing.totalCost - costBasis;
              const totalValue = price * newShares;
              const unrealizedGain = totalValue - newTotalCost;
              const unrealizedGainPct = newTotalCost > 0 ? (unrealizedGain / newTotalCost) * 100 : 0;
              holdings = portfolio.holdings.map((h) =>
                h.ticker === ticker
                  ? {
                      ...h,
                      shares: newShares,
                      totalCost: newTotalCost,
                      totalValue,
                      unrealizedGain,
                      unrealizedGainPct,
                      currentPrice: price,
                    }
                  : h
              );
            }

            const newPortfolio = recomputeTotals({
              ...portfolio,
              cashBalance: portfolio.cashBalance + proceeds,
              realizedGain: portfolio.realizedGain + realizedGain,
              holdings,
            });

            const tx: Transaction = {
              id: `tx-${Date.now()}`,
              type: "sell",
              ticker,
              name: nameFor(ticker),
              shares,
              price,
              total: proceeds,
              timestamp: new Date().toISOString(),
            };

            set({ portfolio: newPortfolio, transactions: [tx, ...transactions] });
            return { success: true };
          }
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "stocksim-portfolio",
      partialize: (state) => ({ portfolio: state.portfolio, transactions: state.transactions }),
    }
  )
);
