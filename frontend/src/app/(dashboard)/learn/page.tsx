"use client";

import { useState } from "react";
import { ChevronDown, BookOpen, BarChart2, TrendingUp, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const CURRICULUM = [
  {
    category: "Fundamentals",
    icon: BookOpen,
    lessons: [
      {
        title: "What is a Stock?",
        duration: "3 min",
        body: "A stock (or share) represents a fractional ownership stake in a company. When you buy a share of Apple, you own a tiny piece of Apple Inc. — entitled to a proportional claim on its assets and earnings.\n\nCompanies issue stock through an IPO (Initial Public Offering) to raise capital for growth. After that, shares trade between investors on exchanges like the NYSE or NASDAQ.\n\nStock prices change constantly based on supply (sellers) and demand (buyers), driven by company performance, earnings expectations, macroeconomic conditions, and investor sentiment.",
      },
      {
        title: "Market Capitalization",
        duration: "3 min",
        body: "Market cap = Share price × Total shares outstanding. It represents the market's total valuation of a company.\n\n• Large cap (>$10B): Established, lower volatility — e.g., Apple ($3.3T), Microsoft ($3.2T)\n• Mid cap ($2B–$10B): Growth phase, moderate risk\n• Small cap (<$2B): Higher growth potential, higher volatility\n\nMarket cap is useful for comparing companies within the same sector and for building diversified portfolios across size categories.",
      },
      {
        title: "Bull vs Bear Markets",
        duration: "3 min",
        body: "A bull market is broadly defined as a 20%+ rise in prices from a recent low, typically sustained over months or years. Bull markets are fueled by economic growth, rising earnings, and investor optimism.\n\nA bear market is a 20%+ decline from a recent high. Bears are often triggered by recessions, rising interest rates, or external shocks (e.g., 2008 financial crisis, 2020 COVID crash).\n\nA correction is a milder 10–20% decline — common and healthy within longer bull runs. Understanding the current market regime helps you choose the right strategy.",
      },
      {
        title: "What Moves Stock Prices?",
        duration: "4 min",
        body: "Prices move whenever the market's collective estimate of a company's future earnings changes. Key catalysts:\n\n• Earnings reports (quarterly EPS beats or misses)\n• Fed interest rate decisions (higher rates → lower valuations)\n• Macroeconomic data (CPI, unemployment, GDP)\n• Company-specific news (product launches, CEO changes, lawsuits)\n• Analyst upgrades/downgrades and price target changes\n• Sector rotation (capital moving between industries)\n\nShort-term prices are driven by sentiment; long-term prices follow fundamentals.",
      },
    ],
  },
  {
    category: "Valuation",
    icon: BarChart2,
    lessons: [
      {
        title: "P/E Ratio",
        duration: "4 min",
        body: "The Price-to-Earnings (P/E) ratio = Share price ÷ Earnings per share (EPS). It answers: how much are investors paying for each $1 of earnings?\n\n• High P/E (e.g., NVDA at 68×): Market expects strong future growth\n• Low P/E (e.g., JPM at 12×): Mature or value-oriented business\n• Negative P/E: Company is unprofitable\n\nAlways compare P/E within the same sector — tech P/Es are typically higher than financials. The S&P 500 has historically averaged ~16–18× P/E.\n\nForward P/E (using next year's estimated earnings) is often more useful than trailing P/E.",
      },
      {
        title: "Earnings Per Share (EPS)",
        duration: "3 min",
        body: "EPS = Net income ÷ Diluted shares outstanding. It's the most closely watched metric each quarter.\n\nWhen a company reports earnings, analysts compare actual EPS to the consensus estimate:\n• Beat: Stock often rallies (sometimes 5–10%+)\n• Miss: Stock often drops\n• Meet: May still fall if guidance is weak (\"sell the news\")\n\nAdjusted EPS strips out one-time items (restructuring, write-offs) and is usually the figure that matters most to markets.\n\nEPS growth rate — how fast earnings are growing year-over-year — is often more important than the absolute EPS number.",
      },
      {
        title: "Dividend Yield",
        duration: "3 min",
        body: "Dividend yield = Annual dividend per share ÷ Share price. It shows the income return from owning a stock.\n\nExample: A $40 annual dividend on a $200 stock = 2% yield.\n\nHigh-yield sectors: Utilities, REITs, Consumer Staples, Telecoms (typically 3–6%)\nLow/no yield: High-growth tech companies that reinvest all earnings\n\nCaution: A very high yield (>8–10%) may signal a dividend at risk of being cut. Always check the payout ratio (dividends ÷ earnings) — above 80–90% is a warning sign.",
      },
      {
        title: "Price-to-Book (P/B) Ratio",
        duration: "3 min",
        body: "P/B = Share price ÷ Book value per share. Book value = Total assets − Total liabilities.\n\nA P/B below 1 means you're buying $1 of net assets for less than $1 — theoretically cheap. Warren Buffett built much of his early career on low P/B stocks.\n\nHowever, book value understates the value of intangibles (brands, software, patents). That's why tech companies trade at 10–30× book — their value isn't on the balance sheet.\n\nP/B is most meaningful for capital-heavy industries: banks, insurance, manufacturing.",
      },
    ],
  },
  {
    category: "Strategies",
    icon: TrendingUp,
    lessons: [
      {
        title: "Buy & Hold",
        duration: "4 min",
        body: "Buy high-quality companies and hold through market cycles. The premise: great businesses compound value over time, and timing the market is nearly impossible.\n\nAdvantages:\n• Lower transaction costs and taxes (long-term capital gains rates)\n• Benefits from compound growth over decades\n• Less emotional decision-making\n• Outperforms most active strategies over 10+ year horizons\n\nBest for: Index funds (e.g., SPY, QQQ), blue-chip companies with durable competitive advantages.\n\nKey risk: Requires conviction to hold through 30–50% drawdowns without selling.",
      },
      {
        title: "Dollar Cost Averaging (DCA)",
        duration: "3 min",
        body: "Invest a fixed dollar amount at regular intervals (weekly, monthly) regardless of price. You automatically buy more shares when prices are low and fewer when prices are high.\n\nExample: $500/month into AAPL over 12 months averages out your cost basis across ups and downs.\n\nAdvantages:\n• Removes the pressure of timing the market\n• Reduces impact of volatility on your average cost\n• Builds disciplined investing habits\n\nDCA is particularly powerful during bear markets and corrections — you accumulate shares cheaply. Most 401(k) contributions automatically use DCA.",
      },
      {
        title: "Diversification",
        duration: "4 min",
        body: "Diversification reduces unsystematic (company-specific) risk by spreading capital across many assets.\n\n• Sector diversification: Don't put all money in tech. Include healthcare, financials, consumer staples.\n• Geographic diversification: Domestic + international + emerging markets\n• Asset class diversification: Stocks + bonds + real estate + commodities\n• Size diversification: Large cap + mid cap + small cap\n\nThe math: Combining two stocks with 0.5 correlation reduces portfolio volatility below either individual stock's volatility.\n\nTarget: 15–25 stocks across 5+ sectors provides most of the diversification benefit. Beyond 30 stocks, marginal benefit diminishes.",
      },
      {
        title: "Momentum Trading",
        duration: "4 min",
        body: "Momentum: assets that have performed well recently tend to continue outperforming over short-to-medium horizons.\n\nCommon approaches:\n• Relative momentum: Buy the strongest performers in a universe each month\n• Absolute momentum: Buy only when an asset is above its long-term moving average\n• SMA crossover: Buy when fast MA crosses above slow MA (e.g., 10-day crosses 30-day)\n\nMomentum tends to work over 3–12 month horizons but can reverse sharply (\"momentum crashes\").\n\nRisk: High turnover means higher taxes and transaction costs. Best suited for tax-advantaged accounts.",
      },
    ],
  },
  {
    category: "Risk Management",
    icon: Shield,
    lessons: [
      {
        title: "Position Sizing",
        duration: "4 min",
        body: "Position sizing determines how much capital to allocate to each investment. Even a correct thesis can destroy a portfolio if the position is too large.\n\nCommon rules:\n• Equal weight: 1/N in each of N positions (simplest)\n• 5% max rule: No single stock exceeds 5% of portfolio\n• Kelly Criterion: Mathematical formula based on edge and odds\n\nFor beginners, equal weighting across 10–20 positions is practical and proven.\n\nThe goal: A single bad bet (fraud, bankruptcy, catastrophic product failure) shouldn't derail your overall returns.",
      },
      {
        title: "Stop Losses",
        duration: "3 min",
        body: "A stop loss is a pre-defined exit price that limits downside on any position.\n\nCommon approaches:\n• Percentage stop: Exit if stock falls 7–8% below cost (used by IBD/CANSLIM)\n• Moving average stop: Exit if stock closes below 50-day or 200-day MA\n• ATR stop: Exit if stock moves 2× its Average True Range below entry\n\nPros: Prevents small losses from becoming large ones; removes emotional decision-making\nCons: Can trigger on normal volatility (\"stopped out\" before a recovery)\n\nTip: Place stops below meaningful support levels, not arbitrary percentages.",
      },
      {
        title: "Sharpe Ratio",
        duration: "4 min",
        body: "Sharpe Ratio = (Portfolio Return − Risk-Free Rate) ÷ Portfolio Volatility\n\nIt measures return per unit of risk. An annualized Sharpe of:\n• < 1.0: Suboptimal risk-adjusted return\n• 1.0–2.0: Good (most successful funds operate here)\n• > 2.0: Excellent (rare, often strategy-specific)\n• > 3.0: Exceptional (hedge funds targeting this often use significant leverage)\n\nThe S&P 500 historically averages ~0.5–0.6 Sharpe over long periods.\n\nSharpe can be misleading with options strategies that clip upside and distribute losses rarely — always pair with max drawdown analysis.",
      },
      {
        title: "Max Drawdown",
        duration: "3 min",
        body: "Max drawdown = The largest peak-to-trough decline in portfolio value. It represents the worst loss any investor who bought at the peak and sold at the trough would have experienced.\n\nExample: Portfolio peaks at $150k, falls to $90k — max drawdown = 40%.\n\nWhy it matters: Human psychology struggles to hold through large drawdowns. Knowing historical max drawdown helps set realistic expectations before you're tested.\n\nHistorical reference:\n• S&P 500: ~57% in 2008–2009, ~34% in 2020\n• Tech-heavy portfolios: typically worse\n\nAsk yourself: Can I stomach a 40% drawdown without panic-selling? If not, reduce risk now.",
      },
    ],
  },
];

export default function LearnPage() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {CURRICULUM.map(({ category, icon: Icon, lessons }) => (
        <section key={category}>
          <div className="flex items-center gap-2 mb-3">
            <Icon size={13} className="text-muted-foreground" />
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{category}</p>
          </div>
          <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border">
            {lessons.map((lesson) => {
              const id = `${category}-${lesson.title}`;
              const isOpen = open === id;
              return (
                <div key={lesson.title}>
                  <button
                    onClick={() => setOpen(isOpen ? null : id)}
                    className="w-full flex items-center gap-3 px-5 py-4 hover:bg-secondary/40 transition-colors text-left"
                  >
                    <div className="flex-1">
                      <p className="text-[13px] font-semibold text-foreground">{lesson.title}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{lesson.duration} read</p>
                    </div>
                    <ChevronDown
                      size={14}
                      className={cn(
                        "text-muted-foreground transition-transform flex-shrink-0",
                        isOpen && "rotate-180"
                      )}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 border-t border-border bg-secondary/20">
                      {lesson.body.split("\n\n").map((para, idx) => (
                        <p
                          key={idx}
                          className={cn(
                            "text-[13px] text-muted-foreground leading-relaxed whitespace-pre-line",
                            idx > 0 && "mt-3"
                          )}
                        >
                          {para}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
