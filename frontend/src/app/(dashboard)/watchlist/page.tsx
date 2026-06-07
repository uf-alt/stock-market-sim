"use client";

import Link from "next/link";
import { useMarketStore } from "@/stores/market.store";
import { formatCurrency, formatPercent, formatChange } from "@/utils/format";
import { Star, TrendingUp } from "lucide-react";

export default function WatchlistPage() {
  const { stocks, watchlist, toggleWatchlist } = useMarketStore();
  const watched = stocks.filter((s) => watchlist.includes(s.ticker));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-3.5">
        <p className="text-[12px] uppercase tracking-wider text-muted-foreground font-semibold">Watchlist</p>
        <p className="text-[12px] text-muted-foreground/60">{watched.length} stocks</p>
      </div>

      {watched.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <Star size={32} className="text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-[15px] text-muted-foreground mb-3">Your watchlist is empty.</p>
          <Link href="/markets" className="text-primary font-semibold text-[13px] hover:underline">
            Browse markets and star stocks →
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] border-collapse">
            <thead>
              <tr>
                <th className="text-[10px] uppercase tracking-wider text-muted-foreground/70 py-2.5 px-4 font-semibold border-y border-border bg-transparent text-left">Company</th>
                <th className="text-[10px] uppercase tracking-wider text-muted-foreground/70 py-2.5 px-4 font-semibold border-y border-border bg-transparent text-right">Price</th>
                <th className="text-[10px] uppercase tracking-wider text-muted-foreground/70 py-2.5 px-4 font-semibold border-y border-border bg-transparent text-right">Change</th>
                <th className="text-[10px] uppercase tracking-wider text-muted-foreground/70 py-2.5 px-4 font-semibold border-y border-border bg-transparent text-right">Mkt Cap</th>
                <th className="border-y border-border bg-transparent py-2.5 px-4 w-20" />
              </tr>
            </thead>
            <tbody>
              {watched.map((s, i) => (
                <tr key={s.ticker} className="group hover:bg-primary/5 transition-colors">
                  <td className={`py-4 px-4 ${i > 0 ? "border-t border-border" : ""}`}>
                    <div className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center text-[10px] font-black text-muted-foreground flex-shrink-0">
                        {s.ticker.slice(0, 2)}
                      </span>
                      <div>
                        <Link href={`/stock/${s.ticker}`} className="font-bold hover:text-primary transition-colors">
                          {s.ticker}
                        </Link>
                        <p className="text-[11px] text-muted-foreground">{s.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className={`py-4 px-4 text-right font-semibold ${i > 0 ? "border-t border-border" : ""}`}>
                    {formatCurrency(s.price)}
                  </td>
                  <td className={`py-4 px-4 text-right ${i > 0 ? "border-t border-border" : ""}`}>
                    <span className={`font-semibold ${s.changePct >= 0 ? "text-gain" : "text-loss"}`}>
                      {formatPercent(s.changePct)}
                    </span>
                  </td>
                  <td className={`py-4 px-4 text-right text-muted-foreground ${i > 0 ? "border-t border-border" : ""}`}>
                    {s.marketCap}
                  </td>
                  <td className={`py-4 px-4 text-right ${i > 0 ? "border-t border-border" : ""}`}>
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => toggleWatchlist(s.ticker)}
                        className="text-amber-400 hover:text-muted-foreground transition-colors"
                        title="Remove from watchlist"
                      >
                        <Star size={13} fill="currentColor" />
                      </button>
                      <Link href={`/stock/${s.ticker}`} className="text-[12px] font-semibold text-primary hover:underline">
                        View →
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
