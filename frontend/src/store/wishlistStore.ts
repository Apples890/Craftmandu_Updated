import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type WishlistItem = {
  id: string;            // product id or slug
  name: string;
  priceCents: number;
  imageUrl?: string | null;
  slug?: string;
  vendorName?: string;
};

type WishlistState = {
  items: WishlistItem[];
  add: (item: WishlistItem) => void;
  remove: (id: string) => void;
  toggle: (item: WishlistItem) => void;
  clear: () => void;
  has: (id: string) => boolean;
  count: number;
};

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      add(item) {
        if (get().items.some((i) => i.id === item.id)) return;
        set({ items: [...get().items, item] });
      },
      remove(id) {
        set({ items: get().items.filter((i) => i.id !== id) });
      },
      toggle(item) {
        if (get().items.some((i) => i.id === item.id)) {
          set({ items: get().items.filter((i) => i.id !== item.id) });
        } else {
          set({ items: [...get().items, item] });
        }
      },
      clear() {
        set({ items: [] });
      },
      has(id) {
        return get().items.some((i) => i.id === id);
      },
      get count() {
        return get().items.length;
      },
    }),
    {
      name: 'wishlist-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

