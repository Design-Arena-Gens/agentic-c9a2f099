import { create } from 'zustand';
import { PublicUser } from '@/lib/types';

type SessionState = {
  user: PublicUser | null;
  loading: boolean;
  error?: string;
  fetchSession: () => Promise<void>;
  setUser: (user: PublicUser | null) => void;
  logout: () => Promise<void>;
};

export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  loading: true,
  async fetchSession() {
    try {
      const res = await fetch('/api/auth/session');
      if (!res.ok) {
        set({ user: null, loading: false });
        return;
      }
      const data = await res.json();
      if (data.authenticated) {
        set({ user: data.user, loading: false });
      } else {
        set({ user: null, loading: false });
      }
    } catch (error) {
      console.error(error);
      set({ user: null, loading: false, error: 'Gagal memuat sesi' });
    }
  },
  setUser(user) {
    set({ user });
  },
  async logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    set({ user: null });
  },
}));
