import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/lib/supabase";
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
  reset: () => void;
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
  const holdings = portfolio.holdings.map((h) => ({
    ...h,
    allocation: totalValue > 0 ? (h.totalValue / totalValue) * 100 : 0,
  }));
  return { ...portfolio, totalValue, totalCost, unrealizedGain, unrealizedGainPct, holdings };
}

// ── Supabase sync helpers ─────────────────────────────────────────────────────

async function getUserId(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user.id ?? null;
}

async function syncPortfolio(portfolio: Portfolio, uid: string) {
  await supabase.from("portfolios").upsert({
    id: uid,
    cash_balance: portfolio.cashBalance,
    realized_gain: portfolio.realizedGain,
    updated_at: new Date().toISOString(),
  });
}

async function syncHolding(holding: Holding, uid: string) {
  await supabase.from("holdings").upsert(
    {
      user_id: uid,
      ticker: holding.ticker,
      name: holding.name,
      shares: holding.shares,
      avg_cost: holding.avgCost,
      current_price: holding.currentPrice,
      total_cost: holding.totalCost,
      total_value: holding.totalValue,
      unrealized_gain: holding.unrealizedGain,
      unrealized_gain_pct: holding.unrealizedGainPct,
      allocation: holding.allocation,
    },
    { onConflict: "user_id,ticker" }
  );
}

async function deleteHolding(ticker: string, uid: string) {
  await supabase.from("holdings").delete().eq("user_id", uid).eq("ticker", ticker);
}

async function insertTransaction(tx: Transaction, uid: string) {
  await supabase.from("transactions").insert({
    id: tx.id,
    user_id: uid,
    type: tx.type,
    ticker: tx.ticker,
    name: tx.name,
    shares: tx.shares,
    price: tx.price,
    total: tx.total,
    created_at: tx.timestamp,
  });
}

// ── Store ─────────────────────────────────────────────────────────────────────

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set, get) => ({
      portfolio: EMPTY_PORTFOLIO,
      transactions: [],
      isLoading: false,

      fetchPortfolio: async () => {
        const uid = await getUserId();
        if (!uid) return;

        const [portfolioRes, holdingsRes, txRes] = await Promise.all([
          supabase.from("portfolios").select("*").eq("id", uid).single(),
          supabase.from("holdings").select("*").eq("user_id", uid),
          supabase
            .from("transactions")
            .select("*")
            .eq("user_id", uid)
            .order("created_at", { ascending: false }),
        ]);

        if (!portfolioRes.data) return;

        const holdings: Holding[] = (holdingsRes.data ?? []).map((h) => ({
          ticker: h.ticker,
          name: h.name,
          shares: h.shares,
          avgCost: h.avg_cost,
          currentPrice: h.current_price,
          totalValue: h.total_value,
          totalCost: h.total_cost,
          unrealizedGain: h.unrealized_gain,
          unrealizedGainPct: h.unrealized_gain_pct,
          allocation: h.allocation,
        }));

        const transactions: Transaction[] = (txRes.data ?? []).map((t) => ({
          id: t.id,
          type: t.type,
          ticker: t.ticker,
          name: t.name,
          shares: t.shares,
          price: t.price,
          total: t.total,
          timestamp: t.created_at,
        }));

        const portfolio = recomputeTotals({
          id: portfolioRes.data.id,
          cashBalance: portfolioRes.data.cash_balance,
          totalValue: 0,
          totalCost: 0,
          unrealizedGain: 0,
          unrealizedGainPct: 0,
          realizedGain: portfolioRes.data.realized_gain,
          dailyChange: 0,
          dailyChangePct: 0,
          holdings,
        });

        set({ portfolio, transactions });
      },

      fetchTransactions: async () => {
        // Covered by fetchPortfolio
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
                  ? { ...h, shares: newShares, avgCost: newAvgCost, totalCost: newTotalCost, totalValue, unrealizedGain, unrealizedGainPct, currentPrice: price }
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

            // Sync to Supabase in background
            const uid = await getUserId();
            if (uid) {
              const updatedHolding = newPortfolio.holdings.find((h) => h.ticker === ticker)!;
              await Promise.all([
                syncPortfolio(newPortfolio, uid),
                syncHolding(updatedHolding, uid),
                insertTransaction(tx, uid),
              ]);
            }

            return { success: true };
          } else {
            const existing = portfolio.holdings.find((h) => h.ticker === ticker);
            if (!existing || existing.shares < shares) {
              return { success: false, error: "Insufficient shares" };
            }

            const proceeds = price * shares;
            const costBasis = existing.avgCost * shares;
            const realizedGain = proceeds - costBasis;
            const fullSell = existing.shares === shares;

            let holdings: Holding[];
            if (fullSell) {
              holdings = portfolio.holdings.filter((h) => h.ticker !== ticker);
            } else {
              const newShares = existing.shares - shares;
              const newTotalCost = existing.totalCost - costBasis;
              const totalValue = price * newShares;
              const unrealizedGain = totalValue - newTotalCost;
              const unrealizedGainPct = newTotalCost > 0 ? (unrealizedGain / newTotalCost) * 100 : 0;
              holdings = portfolio.holdings.map((h) =>
                h.ticker === ticker
                  ? { ...h, shares: newShares, totalCost: newTotalCost, totalValue, unrealizedGain, unrealizedGainPct, currentPrice: price }
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

            // Sync to Supabase in background
            const uid = await getUserId();
            if (uid) {
              const ops: Promise<unknown>[] = [
                syncPortfolio(newPortfolio, uid),
                insertTransaction(tx, uid),
              ];
              if (fullSell) {
                ops.push(deleteHolding(ticker, uid));
              } else {
                const updatedHolding = newPortfolio.holdings.find((h) => h.ticker === ticker)!;
                ops.push(syncHolding(updatedHolding, uid));
              }
              await Promise.all(ops);
            }

            return { success: true };
          }
        } finally {
          set({ isLoading: false });
        }
      },

      reset: () => {
        set({ portfolio: EMPTY_PORTFOLIO, transactions: [] });
        // Sync reset to Supabase in background
        getUserId().then(async (uid) => {
          if (!uid) return;
          await Promise.all([
            supabase.from("holdings").delete().eq("user_id", uid),
            supabase.from("transactions").delete().eq("user_id", uid),
            supabase.from("portfolios").upsert({
              id: uid,
              cash_balance: 100_000,
              realized_gain: 0,
              updated_at: new Date().toISOString(),
            }),
          ]);
        });
      },
    }),
    {
      name: "stocksim-portfolio",
      partialize: (state) => ({ portfolio: state.portfolio, transactions: state.transactions }),
    }
  )
);
