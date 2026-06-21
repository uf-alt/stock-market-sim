"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { usePortfolioStore } from "@/stores/portfolio.store";
import { formatCurrency, formatDate } from "@/utils/format";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { user, logout } = useAuthStore();
  const { portfolio, transactions, reset } = usePortfolioStore();
  const router = useRouter();
  const [confirmReset, setConfirmReset] = useState(false);

  const handleReset = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    reset();
    setConfirmReset(false);
  };

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const returnPct = ((portfolio.totalValue - 100_000) / 100_000) * 100;

  return (
    <div className="max-w-lg space-y-4">
      {/* Profile */}
      <section className="bg-card border border-border rounded-xl p-5">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4">Profile</p>
        <div className="flex items-center gap-4 mb-5">
          <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center font-bold text-lg text-primary-foreground flex-shrink-0">
            {user?.username?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div>
            <p className="font-semibold text-foreground">{user?.username}</p>
            <p className="text-[12px] text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Level", value: `Lv ${user?.level ?? 1}` },
            { label: "XP", value: `${user?.xp ?? 0} / ${user?.xpToNext ?? 500}` },
            { label: "Portfolio value", value: formatCurrency(portfolio.totalValue) },
            { label: "Total return", value: `${returnPct >= 0 ? "+" : ""}${returnPct.toFixed(2)}%` },
            { label: "Total trades", value: String(transactions.length) },
            { label: "Joined", value: user?.joinedAt ? formatDate(user.joinedAt) : "—" },
          ].map(({ label, value }) => (
            <div key={label} className="bg-secondary rounded-lg px-3 py-2.5">
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-0.5">{label}</p>
              <p className="text-[13px] font-bold font-mono text-foreground">{value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Portfolio reset */}
      <section className="bg-card border border-border rounded-xl p-5">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Portfolio</p>
        <p className="text-[12px] text-muted-foreground mb-4 leading-relaxed">
          Reset your portfolio back to $100,000 cash. All holdings and transaction history will be permanently cleared.
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className={cn(
              "px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors",
              confirmReset
                ? "bg-destructive text-white hover:bg-destructive/80"
                : "bg-secondary text-foreground hover:bg-secondary/80"
            )}
          >
            {confirmReset ? "Confirm reset" : "Reset portfolio"}
          </button>
          {confirmReset && (
            <button
              onClick={() => setConfirmReset(false)}
              className="px-4 py-2 rounded-lg text-[13px] text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </section>

      {/* Account */}
      <section className="bg-card border border-border rounded-xl p-5">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4">Account</p>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
        >
          <LogOut size={14} />
          Sign out
        </button>
      </section>
    </div>
  );
}
