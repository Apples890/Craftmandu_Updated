// types/order.types.ts
export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface OrderDbRow {
  id: string;
  order_number: string | null;
  customer_id: string;
  vendor_id: string;
  status: OrderStatus;
  subtotal_cents: number;
  shipping_cents: number;
  tax_cents: number;
  total_cents: number;
  currency: string;
  shipping_address_json: Record<string, unknown> | null;
  billing_address_json: Record<string, unknown> | null;
  placed_at: string;
  updated_at: string;
  tracking_number: string | null;
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
  shippingAddress?: Record<string, unknown> | null;
  billingAddress?: Record<string, unknown> | null;
  placedAt: string;
  updatedAt: string;
  trackingNumber?: string | null;
}

export interface OrderItemDbRow {
  id: string;
  order_id: string;
  product_id: string | null;
  variant_id: string | null;
  name_snapshot: string;
  sku_snapshot: string | null;
  unit_price_cents: number;
  qty: number;
  line_total_cents: number;
}
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

export interface PaymentDbRow {
  id: string;
  order_id: string;
  provider: string;
  provider_ref: string | null;
  amount_cents: number;
  status: PaymentStatus;
  paid_at: string | null;
}
export interface Payment {
  id: string;
  orderId: string;
  provider: string;
  providerRef?: string | null;
  amountCents: number;
  status: PaymentStatus;
  paidAt?: string | null;
}

export interface ShipmentDbRow {
  id: string;
  order_id: string;
  carrier: string | null;
  service: string | null;
  tracking_number: string | null;
  shipped_at: string | null;
}
export interface Shipment {
  id: string;
  orderId: string;
  carrier?: string | null;
  service?: string | null;
  trackingNumber?: string | null;
  shippedAt?: string | null;
}
