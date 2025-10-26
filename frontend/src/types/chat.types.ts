// frontend/types/chat.types.ts
export interface Conversation {
  id: string;
  customerId: string;
  vendorId: string;
  productId?: string | null;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}
