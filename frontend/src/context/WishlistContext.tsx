import React from 'react';
import { useWishlistStore } from '@/store/wishlistStore';

export function useWishlist() {
  const items = useWishlistStore((s) => s.items);
  const add = useWishlistStore((s) => s.add);
  const remove = useWishlistStore((s) => s.remove);
  const toggle = useWishlistStore((s) => s.toggle);
  const clear = useWishlistStore((s) => s.clear);
  const has = useWishlistStore((s) => s.has);
  const count = useWishlistStore((s) => s.count);
  return { items, add, remove, toggle, clear, has, count };
}

export const WishlistProvider: React.FC<{ children: React.ReactNode }>= ({ children }) => children as any;

