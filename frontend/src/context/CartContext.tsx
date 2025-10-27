import React, { createContext, useContext } from 'react';
import { useCartStore } from '../store/cartStore';

type CartContextType = ReturnType<typeof useCartStore> extends infer T ? T : any;

const Ctx = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Zustand does not need a provider, but we expose one for compatibility
  // Consumers will access state via the hook below
  return <Ctx.Provider value={undefined as any}>{children}</Ctx.Provider>;
};

export function useCart() {
  // Return a stable snapshot of the cart store API
  const items = useCartStore((s) => s.items);
  const add = useCartStore((s) => s.add);
  const setQty = useCartStore((s) => s.setQty);
  const remove = useCartStore((s) => s.remove);
  const clear = useCartStore((s) => s.clear);
  const count = useCartStore((s) => s.count);
  const totalCents = useCartStore((s) => s.totalCents);
  return { items, add, setQty, remove, clear, count, totalCents };
}
