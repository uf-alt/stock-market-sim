import { create } from "zustand";
import { persist } from "zustand/middleware";
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

      login: async (email, _password) => {
        set({ isLoading: true });
        await new Promise((r) => setTimeout(r, 300));
        const username = email.split("@")[0];
        const user: User = {
          id: `user-${Date.now()}`,
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

      signup: async (username, email, _password) => {
        set({ isLoading: true });
        await new Promise((r) => setTimeout(r, 300));
        const user: User = {
          id: `user-${Date.now()}`,
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
        set({ user: null, isAuthenticated: false });
      },

      init: async () => {
        // persist rehydrates automatically; nothing to do
      },
    }),
    {
      name: "stocksim-auth",
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
