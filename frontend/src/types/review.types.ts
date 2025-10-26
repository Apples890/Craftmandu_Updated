// frontend/types/review.types.ts
export interface Review {
  id: string;
  orderId: string;
  productId: string;
  customerId: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
}
