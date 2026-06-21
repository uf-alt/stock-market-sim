"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, isLoading } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    try {
      await login(email, password);
      const next = searchParams.get("next") ?? "/dashboard";
      router.push(next);
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { error?: { message?: string } } } };
      const msg = apiErr?.response?.data?.error?.message;
      setError(typeof msg === "string" ? msg : "Invalid email or password.");
    }
  };

  return (
    <div className="w-full max-w-sm">
      {/* Logo */}
      <div className="flex items-center gap-2.5 justify-center mb-8">
        <span className="w-7 h-7 rounded-md border border-primary/40 flex items-center justify-center font-black text-[13px] text-primary">
          S
        </span>
        <span className="font-semibold text-[15px] tracking-tight">StockSim</span>
      </div>

      <div className="bg-card border border-border rounded-xl p-8">
        <h2 className="text-2xl font-bold mb-1">
          Welcome back
        </h2>
        <p className="text-[13px] text-muted-foreground mb-6">
          Sign in to your portfolio
        </p>

        {error && (
          <p className="mb-4 px-3 py-2 rounded-lg bg-destructive/10 text-destructive text-[13px]">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div>
            <label className="block text-[12px] font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-1 py-2.5 rounded-lg bg-primary text-white font-semibold text-[14px] hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            {isLoading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="text-center text-[12px] text-muted-foreground mt-5">
          No account?{" "}
          <Link href="/signup" className="text-primary font-semibold hover:underline">
            Create one free
          </Link>
        </p>
      </div>

      <p className="text-center text-[11px] text-muted-foreground/50 mt-5">
        Demo: any email + any password works
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
