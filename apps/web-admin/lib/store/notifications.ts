import { create } from "zustand";

export interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationsState {
  items: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, "id" | "isRead" | "createdAt">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

export const useNotificationsStore = create<NotificationsState>((set) => ({
  items: [
    {
      id: "1",
      title: "Yangi Hamkor",
      message: "Hilton Hotel platformaga ulanish uchun ariza yubordi",
      isRead: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: "2",
      title: "Katta bron",
      message: "Hyatt Regency mehmonxonasiga 15 kishilik guruh bron qildi",
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
  ],
  unreadCount: 2,
  addNotification: (payload) =>
    set((state) => {
      const newItems = [
        {
          ...payload,
          id: Math.random().toString(36).substr(2, 9),
          isRead: false,
          createdAt: new Date().toISOString(),
        },
        ...state.items,
      ];
      return {
        items: newItems,
        unreadCount: newItems.filter((i) => !i.isRead).length,
      };
    }),
  markAsRead: (id) =>
    set((state) => {
      const newItems = state.items.map((i) =>
        i.id === id ? { ...i, isRead: true } : i
      );
      return {
        items: newItems,
        unreadCount: newItems.filter((i) => !i.isRead).length,
      };
    }),
  markAllAsRead: () =>
    set((state) => ({
      items: state.items.map((i) => ({ ...i, isRead: true })),
      unreadCount: 0,
    })),
  clearAll: () => set({ items: [], unreadCount: 0 }),
}));
