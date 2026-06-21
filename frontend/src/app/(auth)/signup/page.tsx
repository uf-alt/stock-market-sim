"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { signup, isLoading } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    try {
      await signup(username, email, password);
      router.push("/dashboard");
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { error?: { message?: string } } } };
      const msg = apiErr?.response?.data?.error?.message;
      setError(typeof msg === "string" ? msg : "Registration failed. Please try again.");
    }
  };

  return (
    <div className="w-full max-w-sm">
      <div className="flex items-center gap-2.5 justify-center mb-8">
        <span className="w-7 h-7 rounded-md border border-primary/40 flex items-center justify-center font-black text-[13px] text-primary">
          S
        </span>
        <span className="font-semibold text-[15px] tracking-tight">StockSim</span>
      </div>

      <div className="bg-card border border-border rounded-xl p-8">
        <h2 className="text-2xl font-bold mb-1">
          Start trading
        </h2>
        <p className="text-[13px] text-muted-foreground mb-6">
          You&apos;ll get $100,000 in virtual cash to start
        </p>

        {error && (
          <p className="mb-4 px-3 py-2 rounded-lg bg-destructive/10 text-destructive text-[13px]">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div>
            <label className="block text-[12px] font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="investorjoe"
              className="w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary transition-colors"
            />
          </div>
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
            {isLoading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="text-center text-[12px] text-muted-foreground mt-5">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
