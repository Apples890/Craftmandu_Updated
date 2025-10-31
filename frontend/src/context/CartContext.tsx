import React from 'react';
import { useCartStore } from '../store/cartStore';

// Cart adapter to keep existing pages working (expects rupees + different item shape)
export function useCart() {
  const coreItems = useCartStore((s) => s.items);
  const add = useCartStore((s) => s.add);
  const setQty = useCartStore((s) => s.setQty);
  const remove = useCartStore((s) => s.remove);
  const clear = useCartStore((s) => s.clear);

  // Map store items (cents) to UI items (rupees)
  const items = coreItems.map((i) => ({
    id: i.id,
    productId: i.id,
    name: i.name,
    price: Math.round(i.priceCents / 100),
    quantity: i.qty,
    image: i.imageUrl || '',
    vendorId: i.vendorId,
    vendorName: '',
  }));

  function addToCart(payload: any) {
    const id = payload.productId || payload.id || payload.slug;
    if (!id) return;
    const qty = payload.quantity || 1;
    const price = Number(payload.price || 0);
    const name = payload.name || payload.title || 'Product';
    const imageUrl = payload.image || payload.imageUrl || (Array.isArray(payload.images) ? payload.images[0] : undefined) || '';
    add({ id, name, priceCents: Math.max(0, Math.round(price * 100)), qty, imageUrl, vendorId: payload.vendorId, vendorName: payload.vendorName });
  }

  function updateQuantity(productId: string, quantity: number) {
    setQty(productId, quantity);
  }

  function removeFromCart(productId: string) {
    remove(productId);
  }

  function clearCart() {
    clear();
  }

  const itemCount = coreItems.reduce((n, i) => n + i.qty, 0);
  const total = Math.round(coreItems.reduce((sum, i) => sum + i.priceCents * i.qty, 0) / 100);

  return { items, addToCart, updateQuantity, removeFromCart, clearCart, itemCount, total };
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => children as any;

