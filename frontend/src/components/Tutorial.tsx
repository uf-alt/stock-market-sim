"use client";

import { useState, useEffect } from "react";
import { X, TrendingUp, BarChart2, BookOpen, Wallet, Zap } from "lucide-react";

const STEPS = [
  {
    icon: Zap,
    title: "Welcome to StockSim",
    description:
      "Practice investing with $100,000 in virtual cash. Build real skills without any real money at risk.",
  },
  {
    icon: TrendingUp,
    title: "Browse the Markets",
    description:
      "Search stocks across sectors, view live prices and key stats, then buy or sell with a single click.",
  },
  {
    icon: Wallet,
    title: "Track Your Portfolio",
    description:
      "Monitor your holdings, watch unrealized gains and losses update in real time, and review your full transaction history.",
  },
  {
    icon: BarChart2,
    title: "Backtest Strategies",
    description:
      "Pick a strategy — Buy & Hold, SMA Crossover, or RSI — and simulate how it would have performed over any date range.",
  },
  {
    icon: BookOpen,
    title: "Learn as You Trade",
    description:
      "The Learn section covers fundamentals, valuation metrics, trading strategies, and risk management in bite-sized lessons.",
  },
];

export function Tutorial() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!localStorage.getItem("stocksim-tutorial-seen")) {
      setOpen(true);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem("stocksim-tutorial-seen", "1");
    setOpen(false);
  };

  if (!open) return null;

  const { icon: Icon, title, description } = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative bg-card border border-border rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl">
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={16} />
        </button>

        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-6">
          {step + 1} / {STEPS.length}
        </p>

        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
          <Icon size={22} className="text-primary" />
        </div>

        <h2 className="text-xl font-bold mb-2">{title}</h2>
        <p className="text-[14px] text-muted-foreground leading-relaxed mb-8">
          {description}
        </p>

        <div className="flex gap-1.5 mb-6">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === step ? "w-6 bg-primary" : "w-1.5 bg-border"
              }`}
            />
          ))}
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
            className="text-[13px] text-muted-foreground hover:text-foreground disabled:opacity-0 transition-colors"
          >
            Back
          </button>
          <button
            onClick={isLast ? dismiss : () => setStep((s) => s + 1)}
            className="px-5 py-2 bg-primary text-primary-foreground rounded-md text-[13px] font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all"
          >
            {isLast ? "Get started" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
