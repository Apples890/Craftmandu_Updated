// models/order.model.ts
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
  total_cents: number; // generated column
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

export const OrderModel = {
  fromDb: (r: OrderDbRow): Order => ({
    id: r.id,
    orderNumber: r.order_number,
    customerId: r.customer_id,
    vendorId: r.vendor_id,
    status: r.status,
    subtotalCents: r.subtotal_cents,
    shippingCents: r.shipping_cents,
    taxCents: r.tax_cents,
    totalCents: r.total_cents,
    currency: r.currency,
    shippingAddress: r.shipping_address_json,
    billingAddress: r.billing_address_json,
    placedAt: r.placed_at,
    updatedAt: r.updated_at,
    trackingNumber: r.tracking_number,
  }),
  toDb: (o: Partial<Order>): Partial<OrderDbRow> => ({
    id: o.id,
    order_number: o.orderNumber ?? null,
    customer_id: o.customerId!,
    vendor_id: o.vendorId!,
    status: o.status!,
    subtotal_cents: o.subtotalCents ?? 0,
    shipping_cents: o.shippingCents ?? 0,
    tax_cents: o.taxCents ?? 0,
    // total_cents is generated on DB. Do not send unless needed.
    currency: o.currency ?? 'USD',
    shipping_address_json: o.shippingAddress ?? null,
    billing_address_json: o.billingAddress ?? null,
    placed_at: o.placedAt,
    updated_at: o.updatedAt,
    tracking_number: o.trackingNumber ?? null,
  }),
};

export const OrderItemModel = {
  fromDb: (r: OrderItemDbRow): OrderItem => ({
    id: r.id,
    orderId: r.order_id,
    productId: r.product_id,
    variantId: r.variant_id,
    nameSnapshot: r.name_snapshot,
    skuSnapshot: r.sku_snapshot,
    unitPriceCents: r.unit_price_cents,
    qty: r.qty,
    lineTotalCents: r.line_total_cents,
  }),
  toDb: (i: Partial<OrderItem>): Partial<OrderItemDbRow> => ({
    id: i.id,
    order_id: i.orderId!,
    product_id: i.productId ?? null,
    variant_id: i.variantId ?? null,
    name_snapshot: i.nameSnapshot!,
    sku_snapshot: i.skuSnapshot ?? null,
    unit_price_cents: i.unitPriceCents!,
    qty: i.qty!,
    line_total_cents: i.lineTotalCents!,
  }),
};

export const PaymentModel = {
  fromDb: (r: PaymentDbRow): Payment => ({
    id: r.id,
    orderId: r.order_id,
    provider: r.provider,
    providerRef: r.provider_ref,
    amountCents: r.amount_cents,
    status: r.status,
    paidAt: r.paid_at,
  }),
  toDb: (p: Partial<Payment>): Partial<PaymentDbRow> => ({
    id: p.id,
    order_id: p.orderId!,
    provider: p.provider!,
    provider_ref: p.providerRef ?? null,
    amount_cents: p.amountCents!,
    status: p.status!,
    paid_at: p.paidAt ?? null,
  }),
};

export const ShipmentModel = {
  fromDb: (r: ShipmentDbRow): Shipment => ({
    id: r.id,
    orderId: r.order_id,
    carrier: r.carrier,
    service: r.service,
    trackingNumber: r.tracking_number,
    shippedAt: r.shipped_at,
  }),
  toDb: (s: Partial<Shipment>): Partial<ShipmentDbRow> => ({
    id: s.id,
    order_id: s.orderId!,
    carrier: s.carrier ?? null,
    service: s.service ?? null,
    tracking_number: s.trackingNumber ?? null,
    shipped_at: s.shippedAt ?? null,
  }),
};
