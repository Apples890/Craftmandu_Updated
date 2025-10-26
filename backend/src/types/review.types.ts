// types/review.types.ts
export interface ReviewDbRow {
  id: string;
  order_id: string;
  product_id: string;
  customer_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}
export interface Review {
  id: string;
  orderId: string;
  productId: string;
  customerId: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
}
