import { create } from "zustand";
import type { Portfolio, Transaction } from "@/types";
import { STOCKS } from "@/lib/mock-data";
import api from "@/lib/api";

const EMPTY_PORTFOLIO: Portfolio = {
  id: "",
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
  executeTrade: (ticker: string, shares: number, type: "buy" | "sell") => Promise<{ success: boolean; error?: string }>;
  fetchPortfolio: () => Promise<void>;
  fetchTransactions: () => Promise<void>;
}

function nameFor(ticker: string) {
  return STOCKS.find((s) => s.ticker === ticker)?.name ?? ticker;
}

export const usePortfolioStore = create<PortfolioState>((set, get) => ({
  portfolio: EMPTY_PORTFOLIO,
  transactions: [],
  isLoading: false,

  fetchPortfolio: async () => {
    try {
      const res = await api.get("/portfolio");
      const d = res.data.data;
      const totalCost: number = d.holdings.reduce((s: number, h: { totalCost: number }) => s + h.totalCost, 0);
      const portfolio: Portfolio = {
        id: d.id,
        cashBalance: Number(d.cashBalance),
        totalValue: Number(d.totalValue),
        totalCost,
        unrealizedGain: Number(d.unrealizedGain),
        unrealizedGainPct: totalCost > 0 ? (Number(d.unrealizedGain) / totalCost) * 100 : 0,
        realizedGain: Number(d.realizedGain),
        dailyChange: 0,
        dailyChangePct: 0,
        holdings: d.holdings.map((h: {
          ticker: string; shares: number; avgCost: number; currentPrice: number;
          totalValue: number; totalCost: number; unrealizedGain: number;
          unrealizedGainPct: number; allocation: number;
        }) => ({
          ticker: h.ticker,
          name: nameFor(h.ticker),
          shares: Number(h.shares),
          avgCost: Number(h.avgCost),
          currentPrice: Number(h.currentPrice),
          totalValue: Number(h.totalValue),
          totalCost: Number(h.totalCost),
          unrealizedGain: Number(h.unrealizedGain),
          unrealizedGainPct: Number(h.unrealizedGainPct),
          allocation: Number(h.allocation),
        })),
      };
      set({ portfolio });
    } catch {
      // Keep current portfolio on failure
    }
  },

  fetchTransactions: async () => {
    try {
      const res = await api.get("/portfolio/transactions");
      // Response shape: { success, data: { data: Transaction[], page, limit, total } }
      const txList = res.data.data.data as {
        id: string; type: string; ticker: string;
        shares: number; price: number; total: number; executedAt: string;
      }[];
      const transactions: Transaction[] = txList.map((tx) => ({
        id: tx.id,
        type: tx.type.toLowerCase() as "buy" | "sell",
        ticker: tx.ticker,
        name: nameFor(tx.ticker),
        shares: Number(tx.shares),
        price: Number(tx.price),
        total: Number(tx.total),
        timestamp: tx.executedAt,
      }));
      set({ transactions });
    } catch {
      // Keep current transactions on failure
    }
  },

  executeTrade: async (ticker, shares, type) => {
    set({ isLoading: true });
    try {
      await api.post("/trading/trade", { ticker, shares, type });
      await get().fetchPortfolio();
      await get().fetchTransactions();
      return { success: true };
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { error?: { message?: string }; message?: string } } };
      const message =
        apiErr?.response?.data?.error?.message ??
        apiErr?.response?.data?.message ??
        "Trade failed";
      return { success: false, error: message };
    } finally {
      set({ isLoading: false });
    }
  },
}));
