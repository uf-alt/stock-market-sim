import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/lib/supabase";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  init: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          set({ isLoading: false });
          throw error;
        }
        if (!data.user) { set({ isLoading: false }); return; }

        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single();

        const user: User = {
          id: data.user.id,
          email: data.user.email ?? email,
          username: profile?.username ?? email.split("@")[0],
          level: profile?.level ?? 1,
          xp: profile?.xp ?? 0,
          xpToNext: profile?.xp_to_next ?? 500,
          streak: profile?.streak ?? 0,
          joinedAt: profile?.created_at ?? data.user.created_at,
        };
        set({ user, isAuthenticated: true, isLoading: false });
      },

      signup: async (username, email, password) => {
        set({ isLoading: true });
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) {
          set({ isLoading: false });
          throw error;
        }
        if (!data.user) { set({ isLoading: false }); return; }

        // Create profile and initial portfolio in parallel
        await Promise.all([
          supabase.from("profiles").insert({
            id: data.user.id,
            username,
            level: 1,
            xp: 0,
            xp_to_next: 500,
            streak: 0,
          }),
          supabase.from("portfolios").insert({
            id: data.user.id,
            cash_balance: 100_000,
            realized_gain: 0,
          }),
        ]);

        const user: User = {
          id: data.user.id,
          email,
          username,
          level: 1,
          xp: 0,
          xpToNext: 500,
          streak: 0,
          joinedAt: new Date().toISOString(),
        };
        set({ user, isAuthenticated: true, isLoading: false });
      },

      logout: () => {
        supabase.auth.signOut();
        set({ user: null, isAuthenticated: false });
      },

      init: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (!profile) return;

        const user: User = {
          id: session.user.id,
          email: session.user.email ?? "",
          username: profile.username,
          level: profile.level,
          xp: profile.xp,
          xpToNext: profile.xp_to_next,
          streak: profile.streak,
          joinedAt: profile.created_at,
        };
        set({ user, isAuthenticated: true });
      },
    }),
    {
      name: "stocksim-auth",
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
