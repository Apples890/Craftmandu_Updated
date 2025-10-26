// types/chat.types.ts
export interface ConversationDbRow {
  id: string;
  customer_id: string;
  vendor_id: string;
  product_id: string | null;
  created_at: string;
}
export interface Conversation {
  id: string;
  customerId: string;
  vendorId: string;
  productId?: string | null;
  createdAt: string;
}

export interface MessageDbRow {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}
