import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";
import api, { setAuthToken } from "@/lib/api";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  init: () => Promise<void>;
}

function parseUser(u: {
  id: string; email: string; username: string;
  level?: number; xp?: number; xpToNext?: number; streak?: number; joinedAt?: string; createdAt?: string;
}): User {
  return {
    id: u.id,
    email: u.email,
    username: u.username,
    level: u.level ?? 1,
    xp: u.xp ?? 0,
    xpToNext: u.xpToNext ?? 500,
    streak: u.streak ?? 0,
    joinedAt: u.joinedAt ?? u.createdAt ?? new Date().toISOString(),
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const res = await api.post("/auth/login", { email, password });
          const payload = res.data.data as { access_token: string; user: Parameters<typeof parseUser>[0] };
          setAuthToken(payload.access_token);
          set({ user: parseUser(payload.user), token: payload.access_token, isAuthenticated: true });
        } finally {
          set({ isLoading: false });
        }
      },

      signup: async (username, email, password) => {
        set({ isLoading: true });
        try {
          const res = await api.post("/auth/register", { username, email, password });
          const payload = res.data.data as { access_token: string; user: Parameters<typeof parseUser>[0] };
          setAuthToken(payload.access_token);
          set({ user: parseUser(payload.user), token: payload.access_token, isAuthenticated: true });
        } finally {
          set({ isLoading: false });
        }
      },

      logout: () => {
        setAuthToken(null);
        set({ user: null, token: null, isAuthenticated: false });
      },

      init: async () => {
        const { token } = get();
        if (!token) return;
        setAuthToken(token);
        try {
          const res = await api.get("/auth/me");
          set({ user: parseUser(res.data.data), isAuthenticated: true });
        } catch {
          setAuthToken(null);
          set({ user: null, token: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: "stocksim-auth",
      partialize: (state) => ({ token: state.token }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) setAuthToken(state.token);
      },
    }
  )
);
