// types/review.types.ts
export interface ReviewDbRow {
  id: string;
  order_id: string;
  product_id: string;
  customer_id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  vendor_reply: string | null;
  vendor_reply_at: string | null;
  created_at: string;
}
export interface Review {
  id: string;
  orderId: string;
  productId: string;
  customerId: string;
  rating: number;
  title?: string | null;
  comment?: string | null;
  vendorReply?: string | null;
  vendorReplyAt?: string | null;
  createdAt: string;
}
