import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Stock } from "@/types";
import { STOCKS } from "@/lib/mock-data";

interface MarketState {
  stocks: Stock[];
  watchlist: string[];
  searchQuery: string;
  selectedSector: string;
  setSearchQuery: (q: string) => void;
  setSelectedSector: (s: string) => void;
  toggleWatchlist: (ticker: string) => void;
  isWatched: (ticker: string) => boolean;
  getFilteredStocks: () => Stock[];
  fetchStocks: () => Promise<void>;
  fetchWatchlist: () => Promise<void>;
}

export const useMarketStore = create<MarketState>()(
  persist(
    (set, get) => ({
      stocks: STOCKS,
      watchlist: [],
      searchQuery: "",
      selectedSector: "All",

      setSearchQuery: (q) => set({ searchQuery: q }),
      setSelectedSector: (s) => set({ selectedSector: s }),

      toggleWatchlist: (ticker) => {
        const { watchlist } = get();
        set({
          watchlist: watchlist.includes(ticker)
            ? watchlist.filter((t) => t !== ticker)
            : [...watchlist, ticker],
        });
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
          const res = await fetch("/api/stocks");
          const liveStocks: { ticker: string; price: number; change: number; changePct: number }[] =
            await res.json();
          if (!liveStocks.length) return;
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
        // no-op — watchlist lives in localStorage via persist
      },
    }),
    {
      name: "stocksim-market",
      partialize: (state) => ({ watchlist: state.watchlist }),
    }
  )
);
