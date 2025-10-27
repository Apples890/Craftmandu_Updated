// models/review.model.ts
export interface ReviewDbRow {
  id: string;
  order_id: string;
  product_id: string;
  customer_id: string;
  rating: number; // 1..5
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

export const ReviewModel = {
  fromDb: (r: ReviewDbRow): Review => ({
    id: r.id,
    orderId: r.order_id,
    productId: r.product_id,
    customerId: r.customer_id,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.created_at,
  }),
  toDb: (rv: Partial<Review>): Partial<ReviewDbRow> => ({
    id: rv.id,
    order_id: rv.orderId!,
    product_id: rv.productId!,
    customer_id: rv.customerId!,
    rating: rv.rating!,
    comment: rv.comment ?? null,
    created_at: rv.createdAt,
  }),
};
