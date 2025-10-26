// store/notificationStore.ts
import { create } from 'zustand';
import { NotificationApi } from '@/api/notification.api';

type NotificationState = {
  items: any[];
  loading: boolean;
  error?: string | null;
  load: (token: string) => Promise<void>;
  markRead: (token: string, id: string, isRead: boolean) => Promise<void>;
  unreadCount: number;
  clear: () => void;
};

export const useNotificationStore = create<NotificationState>()((set, get) => ({
  items: [],
  loading: false,
  error: null,
  async load(token) {
    set({ loading: true, error: null });
    try {
      const { items } = await NotificationApi.list(token);
      set({ items, loading: false });
    } catch (e: any) {
      set({ loading: false, error: e?.message || 'Failed to load notifications' });
    }
  },
  async markRead(token, id, isRead) {
    await NotificationApi.mark(token, id, isRead);
    await get().load(token);
  },
  get unreadCount() {
    return get().items.filter((n: any) => !n.is_read).length;
  },
  clear() {
    set({ items: [], loading: false, error: null });
  },
}));
