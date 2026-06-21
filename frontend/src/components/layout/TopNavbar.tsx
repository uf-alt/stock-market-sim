"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, Bell, Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useMarketStore } from "@/stores/market.store";
import type { Stock } from "@/types";

interface TopNavbarProps {
  title: string;
}

export function TopNavbar({ title }: TopNavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const { setSearchQuery, stocks } = useMarketStore();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Stock[]>([]);

  const handleSearch = (value: string) => {
    setQuery(value);
    setSearchQuery(value);
    if (value.length > 0) {
      setSuggestions(
        stocks.filter(
          (s) =>
            s.ticker.toLowerCase().startsWith(value.toLowerCase()) ||
            s.name.toLowerCase().includes(value.toLowerCase())
        ).slice(0, 5)
      );
    } else {
      setSuggestions([]);
    }
  };

  const navigate = (ticker: string) => {
    setQuery("");
    setSuggestions([]);
    router.push(`/stock/${ticker}`);
  };

  return (
    <header className="h-[52px] bg-card border-b border-border flex items-center px-6 gap-3.5 flex-shrink-0 relative z-10">
      <h1 className="text-[13px] font-semibold text-muted-foreground tracking-wide">{title}</h1>

      {/* Search */}
      <div className="relative flex-1 max-w-[400px] ml-auto">
        <div className="flex items-center gap-2 bg-secondary border border-border rounded-lg px-3.5 py-2 text-muted-foreground text-[13px]">
          <Search size={14} className="flex-shrink-0" />
          <input
            type="text"
            placeholder="Search ticker or company…"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            onBlur={() => setTimeout(() => setSuggestions([]), 150)}
            className="bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/60 w-full text-[13px] font-[var(--font-dm-sans)]"
          />
          <kbd className="text-[10px] text-muted-foreground/50 font-mono bg-background/50 px-1 rounded">
            ⌘K
          </kbd>
        </div>

        {suggestions.length > 0 && (
          <div className="absolute top-full mt-1 left-0 right-0 bg-popover border border-border rounded-lg shadow-xl overflow-hidden z-50">
            {suggestions.map((s) => (
              <button
                key={s.ticker}
                onMouseDown={() => navigate(s.ticker)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary transition-colors text-left"
              >
                <span className="w-9 h-9 rounded-md bg-secondary border border-border flex items-center justify-center text-[10px] font-black text-muted-foreground flex-shrink-0">
                  {s.ticker.slice(0, 2)}
                </span>
                <div>
                  <p className="text-[13px] font-bold text-foreground">{s.ticker}</p>
                  <p className="text-[11px] text-muted-foreground">{s.name}</p>
                </div>
                <span className="ml-auto text-[12px] font-semibold text-foreground">
                  ${s.price.toFixed(2)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button className="relative w-[34px] h-[34px] rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors">
          <Bell size={15} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary border-2 border-card" />
        </button>
        <button
          onClick={toggleTheme}
          className="w-[34px] h-[34px] rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors"
          title="Toggle theme"
        >
          {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>
    </header>
  );
}
