// frontend/types/order.types.ts
export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface OrderItem {
  id: string;
  orderId: string;
  productId?: string | null;
  variantId?: string | null;
  nameSnapshot: string;
  skuSnapshot?: string | null;
  unitPriceCents: number;
  qty: number;
  lineTotalCents: number;
}

export interface Order {
  id: string;
  orderNumber?: string | null;
  customerId: string;
  vendorId: string;
  status: OrderStatus;
  subtotalCents: number;
  shippingCents: number;
  taxCents: number;
  totalCents: number;
  currency: string;
  placedAt: string;
  updatedAt: string;
  trackingNumber?: string | null;
  items?: OrderItem[];
}
