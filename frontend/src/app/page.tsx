"use client";

import Link from "next/link";
import { useTheme } from "@/components/providers/ThemeProvider";
import { Sun, Moon, TrendingUp, ShieldCheck, Zap, BarChart2 } from "lucide-react";

const FEATURES = [
  { icon: TrendingUp, title: "Live Market Data", desc: "Real-time quotes and charts for thousands of US stocks." },
  { icon: ShieldCheck, title: "Risk-Free Trading", desc: "Start with $100,000 in virtual cash. No real money, no real risk." },
  { icon: Zap, title: "Gamified Learning", desc: "Earn XP, unlock achievements, and climb the leaderboard." },
  { icon: BarChart2, title: "Portfolio Analytics", desc: "Track performance, diversification score, and sector allocation." },
];

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-md border border-primary/40 flex items-center justify-center font-black text-[13px] text-primary">
            S
          </span>
          <span className="font-semibold text-[15px] tracking-tight">StockSim</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors"
          >
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          <Link
            href="/login"
            className="px-3.5 py-1.5 rounded-md text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="px-3.5 py-1.5 rounded-md text-[13px] font-semibold bg-primary text-white hover:bg-primary/90 transition-colors"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 max-w-4xl mx-auto w-full">
        <span className="inline-block mb-6 px-3 py-1 rounded-md text-[10px] font-semibold uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
          Paper Trading Simulator
        </span>
        <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] mb-6 tracking-tight">
          Learn to invest.
          <br />
          <span className="text-primary">Risk nothing.</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mb-10 leading-relaxed">
          Practice trading with $100,000 in virtual cash. Track your portfolio,
          study the markets, and build confidence — before committing real money.
        </p>
        <div className="flex gap-3 flex-wrap justify-center">
          <Link
            href="/signup"
            className="px-7 py-3 rounded-lg bg-primary text-white font-semibold text-[14px] hover:bg-primary/90 transition-colors"
          >
            Start trading free
          </Link>
          <Link
            href="/markets"
            className="px-7 py-3 rounded-lg border border-border text-foreground font-semibold text-[14px] hover:bg-secondary transition-colors"
          >
            Browse markets →
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-3 gap-8 text-center">
          {[
            ["$100,000", "Virtual starting cash"],
            ["6,000+", "Tradeable stocks"],
            ["15s", "Portfolio update frequency"],
          ].map(([val, label]) => (
            <div key={label}>
              <p className="text-3xl font-bold text-primary mb-1 font-mono">
                {val}
              </p>
              <p className="text-[13px] text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border px-6 py-20">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors"
            >
              <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center text-primary mb-4">
                <Icon size={18} />
              </div>
              <h3 className="font-bold text-[15px] mb-1.5">{title}</h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border px-8 py-5 flex items-center justify-between text-[12px] text-muted-foreground">
        <span>© 2025 StockSim. For educational purposes only.</span>
        <span>Not financial advice.</span>
      </footer>
    </div>
  );
}
