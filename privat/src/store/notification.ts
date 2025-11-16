import { create } from 'zustand';
import type { NotificationPayload } from '@/lib/types';

type NotificationState = {
  events: NotificationPayload[];
  connected: boolean;
  connect: () => void;
  disconnect: () => void;
  clear: () => void;
};

let eventSource: EventSource | null = null;

export const useNotificationStore = create<NotificationState>((set, get) => ({
  events: [],
  connected: false,
  connect() {
    if (typeof window === 'undefined') return;
    if (eventSource) return;

    eventSource = new EventSource('/api/notifications/stream');
    eventSource.onopen = () => set({ connected: true });
    eventSource.onerror = () => {
      eventSource?.close();
      eventSource = null;
      set({ connected: false });
      setTimeout(() => {
        if (!get().connected) {
          get().connect();
        }
      }, 5000);
    };
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as NotificationPayload;
        set((state) => ({ events: [data, ...state.events].slice(0, 25) }));
      } catch (error) {
        console.error('Invalid notification payload', error);
      }
    };
  },
  disconnect() {
    eventSource?.close();
    eventSource = null;
    set({ connected: false });
  },
  clear() {
    set({ events: [] });
  },
}));
