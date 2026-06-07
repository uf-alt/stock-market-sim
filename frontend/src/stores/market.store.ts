import { create } from "zustand";
import type { Stock } from "@/types";
import { STOCKS } from "@/lib/mock-data";
import api from "@/lib/api";

interface MarketState {
  stocks: Stock[];
  watchlist: string[];
  searchQuery: string;
  selectedSector: string;
  setSearchQuery: (q: string) => void;
  setSelectedSector: (s: string) => void;
  toggleWatchlist: (ticker: string) => Promise<void>;
  isWatched: (ticker: string) => boolean;
  getFilteredStocks: () => Stock[];
  fetchStocks: () => Promise<void>;
  fetchWatchlist: () => Promise<void>;
}

export const useMarketStore = create<MarketState>((set, get) => ({
  // Start with mock data so pages render immediately before API responds
  stocks: STOCKS,
  watchlist: [],
  searchQuery: "",
  selectedSector: "All",

  setSearchQuery: (q) => set({ searchQuery: q }),
  setSelectedSector: (s) => set({ selectedSector: s }),

  toggleWatchlist: async (ticker) => {
    const { watchlist } = get();
    const isCurrentlyWatched = watchlist.includes(ticker);

    // Optimistic update
    set({
      watchlist: isCurrentlyWatched
        ? watchlist.filter((t) => t !== ticker)
        : [...watchlist, ticker],
    });

    try {
      if (isCurrentlyWatched) {
        await api.delete(`/watchlist/${ticker}`);
      } else {
        await api.post("/watchlist", { ticker });
      }
    } catch {
      // Revert on error
      set({ watchlist });
    }
  },

  isWatched: (ticker) => get().watchlist.includes(ticker),

  getFilteredStocks: () => {
    const { stocks, searchQuery, selectedSector } = get();
    return stocks.filter((s) => {
      const matchesSearch =
        !searchQuery ||
        s.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSector =
        selectedSector === "All" || s.sector === selectedSector;
      return matchesSearch && matchesSector;
    });
  },

  fetchStocks: async () => {
    try {
      const res = await api.get("/stocks");
      const liveStocks: { ticker: string; price: number; change: number; changePct: number }[] = res.data.data;
      // Merge live prices with mock catalog (preserves rich metadata like descriptions, 52w data)
      const updated = STOCKS.map((stock) => {
        const live = liveStocks.find((s) => s.ticker === stock.ticker);
        return live
          ? { ...stock, price: live.price, change: live.change, changePct: live.changePct }
          : stock;
      });
      set({ stocks: updated });
    } catch {
      // Keep current stocks on failure
    }
  },

  fetchWatchlist: async () => {
    try {
      const res = await api.get("/watchlist");
      set({ watchlist: res.data.data as string[] });
    } catch {
      // Keep current watchlist on failure
    }
  },
}));
