"use client";

import { useState } from "react";
import Link from "next/link";
import { useMarketStore } from "@/stores/market.store";
import { formatCurrency, formatPercent, formatChange } from "@/utils/format";
import { MARKET_INDICES } from "@/lib/mock-data";
import { ArrowUpDown, Star } from "lucide-react";
import type { Stock } from "@/types";

type SortKey = "ticker" | "price" | "change" | "changePct" | "volume" | "marketCap";

const SECTORS = ["All", "Technology", "Communication Services", "Consumer Discretionary", "Financials", "Healthcare", "Energy", "Consumer Staples"];

function SortTh({ k, label, right = false, sortKey, onSort }: {
  k: SortKey; label: string; right?: boolean; sortKey: SortKey; onSort: (key: SortKey) => void;
}) {
  return (
    <th
      className={`text-[10px] uppercase tracking-wider text-muted-foreground/70 py-2.5 px-4 font-semibold cursor-pointer select-none hover:text-foreground transition-colors whitespace-nowrap border-y border-border bg-transparent ${right ? "text-right" : "text-left"}`}
      onClick={() => onSort(k)}
    >
      {label}
      <ArrowUpDown
        size={10}
        className={`inline ml-1 ${sortKey === k ? "text-primary opacity-100" : "opacity-40"}`}
      />
    </th>
  );
}

export default function MarketsPage() {
  const { getFilteredStocks, searchQuery, setSearchQuery, selectedSector, setSelectedSector, toggleWatchlist, isWatched } = useMarketStore();
  const [sortKey, setSortKey] = useState<SortKey>("marketCap");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const stocks = getFilteredStocks();

  const sorted = [...stocks].sort((a, b) => {
    const va = a[sortKey];
    const vb = b[sortKey];
    if (typeof va === "string" && typeof vb === "string") {
      return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
    }
    return sortDir === "asc" ? (va as number) - (vb as number) : (vb as number) - (va as number);
  });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Index strip */}
      <div className="flex gap-3 overflow-x-auto pb-1">
        {MARKET_INDICES.map((idx) => (
          <div
            key={idx.symbol}
            className="bg-card border border-border rounded-lg px-4 py-3 flex-shrink-0 min-w-[145px]"
          >
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground/70 mb-1">
              {idx.name}
            </p>
            <p className="text-lg font-bold tracking-tight font-mono">
              {idx.value.toLocaleString()}
            </p>
            <p className={`text-[11px] font-semibold mt-0.5 ${idx.changePct >= 0 ? "text-gain" : "text-loss"}`}>
              {formatPercent(idx.changePct)}
            </p>
          </div>
        ))}
      </div>

      {/* Search + sector filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search ticker or company…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 max-w-sm bg-card border border-border rounded-lg px-4 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary transition-colors"
        />
        <div className="flex gap-2 flex-wrap">
          {SECTORS.map((s) => (
            <button
              key={s}
              onClick={() => setSelectedSector(s)}
              className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all border ${
                selectedSector === s
                  ? "bg-primary/10 border-primary/50 text-primary"
                  : "bg-transparent border-border text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Stock table — editorial style */}
      <div>
        <div className="flex items-center justify-between pb-3.5">
          <p className="text-[12px] uppercase tracking-wider text-muted-foreground font-semibold">
            All Stocks
          </p>
          <p className="text-[12px] text-muted-foreground/60">{sorted.length} results</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr>
                <SortTh k="ticker" label="Company" sortKey={sortKey} onSort={toggleSort} />
                <th className="text-[10px] uppercase tracking-wider text-muted-foreground/70 py-2.5 px-4 font-semibold border-y border-border bg-transparent text-left">
                  Sector
                </th>
                <SortTh k="price" label="Price" right sortKey={sortKey} onSort={toggleSort} />
                <SortTh k="change" label="Change" right sortKey={sortKey} onSort={toggleSort} />
                <SortTh k="volume" label="Volume" right sortKey={sortKey} onSort={toggleSort} />
                <SortTh k="marketCap" label="Mkt Cap" right sortKey={sortKey} onSort={toggleSort} />
                <th className="border-y border-border bg-transparent py-2.5 px-4 w-20" />
              </tr>
            </thead>
            <tbody>
              {sorted.map((stock, i) => (
                <StockRow
                  key={stock.ticker}
                  stock={stock}
                  isFirst={i === 0}
                  watched={isWatched(stock.ticker)}
                  onWatch={() => toggleWatchlist(stock.ticker)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StockRow({
  stock,
  isFirst,
  watched,
  onWatch,
}: {
  stock: Stock;
  isFirst: boolean;
  watched: boolean;
  onWatch: () => void;
}) {
  return (
    <tr className="group hover:bg-primary/5 transition-colors cursor-pointer">
      <td className={`px-4 py-4 ${!isFirst ? "border-t border-border" : ""}`}>
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-md bg-secondary border border-border flex items-center justify-center text-[10px] font-black text-muted-foreground flex-shrink-0">
            {stock.ticker.slice(0, 2)}
          </span>
          <div>
            <Link
              href={`/stock/${stock.ticker}`}
              className="font-bold text-[14px] hover:text-primary transition-colors"
            >
              {stock.ticker}
            </Link>
            <p className="text-[11px] text-muted-foreground">{stock.name}</p>
          </div>
        </div>
      </td>
      <td className={`px-4 py-4 ${!isFirst ? "border-t border-border" : ""}`}>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {stock.sector}
        </span>
      </td>
      <td className={`px-4 py-4 text-right font-semibold ${!isFirst ? "border-t border-border" : ""}`}>
        {formatCurrency(stock.price)}
      </td>
      <td className={`px-4 py-4 text-right ${!isFirst ? "border-t border-border" : ""}`}>
        <span className={`text-[13px] font-semibold ${stock.changePct >= 0 ? "text-gain" : "text-loss"}`}>
          {formatPercent(stock.changePct)}
        </span>
        <br />
        <span className={`text-[11px] ${stock.changePct >= 0 ? "text-gain/70" : "text-loss/70"}`}>
          {formatChange(stock.change)}
        </span>
      </td>
      <td className={`px-4 py-4 text-right text-muted-foreground ${!isFirst ? "border-t border-border" : ""}`}>
        {stock.volume}
      </td>
      <td className={`px-4 py-4 text-right text-muted-foreground ${!isFirst ? "border-t border-border" : ""}`}>
        {stock.marketCap}
      </td>
      <td className={`px-4 py-4 text-right ${!isFirst ? "border-t border-border" : ""}`}>
        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.preventDefault(); onWatch(); }}
            className={`p-1 rounded transition-colors ${watched ? "text-amber-400" : "text-muted-foreground hover:text-amber-400"}`}
          >
            <Star size={13} fill={watched ? "currentColor" : "none"} />
          </button>
          <Link
            href={`/stock/${stock.ticker}`}
            className="text-[12px] font-semibold text-primary hover:underline whitespace-nowrap"
          >
            View →
          </Link>
        </div>
      </td>
    </tr>
  );
}
