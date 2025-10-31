// store/cartStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type CartItem = {
  id: string;            // product or variant id
  name: string;
  priceCents: number;
  qty: number;
  imageUrl?: string | null;
  vendorId?: string;
  vendorName?: string;
};

type CartState = {
  items: CartItem[];
  add: (item: CartItem) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add(item) {
        const items = [...get().items];
        const idx = items.findIndex((i) => i.id === item.id);
        if (idx >= 0) {
          items[idx] = { ...items[idx], qty: items[idx].qty + item.qty };
        } else {
          items.push(item);
        }
        set({ items });
      },
      setQty(id, qty) {
        if (qty <= 0) return set({ items: get().items.filter((i) => i.id != id) });
        set({
          items: get().items.map((i) => (i.id === id ? { ...i, qty } : i)),
        });
      },
      remove(id) {
        set({ items: get().items.filter((i) => i.id !== id) });
      },
      clear() {
        set({ items: [] });
      },
    }),
    {
      name: 'cart-storage',
      version: 2,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
      migrate: (persisted: any, fromVersion) => {
        if (!persisted) return { items: [] } as any;
        // Drop any accidentally persisted computed props from older versions
        if (fromVersion && fromVersion < 2) {
          const items = Array.isArray((persisted as any).items) ? (persisted as any).items : [];
          return { items } as any;
        }
        return persisted;
      },
    }
  )
);
