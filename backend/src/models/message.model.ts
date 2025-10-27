// models/message.model.ts
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

export const ConversationModel = {
  fromDb: (r: ConversationDbRow): Conversation => ({
    id: r.id,
    customerId: r.customer_id,
    vendorId: r.vendor_id,
    productId: r.product_id,
    createdAt: r.created_at,
  }),
  toDb: (c: Partial<Conversation>): Partial<ConversationDbRow> => ({
    id: c.id,
    customer_id: c.customerId!,
    vendor_id: c.vendorId!,
    product_id: c.productId ?? null,
    created_at: c.createdAt,
  }),
};

export const MessageModel = {
  fromDb: (r: MessageDbRow): Message => ({
    id: r.id,
    conversationId: r.conversation_id,
    senderId: r.sender_id,
    content: r.content,
    isRead: r.is_read,
    createdAt: r.created_at,
  }),
  toDb: (m: Partial<Message>): Partial<MessageDbRow> => ({
    id: m.id,
    conversation_id: m.conversationId!,
    sender_id: m.senderId!,
    content: m.content!,
    is_read: m.isRead ?? false,
    created_at: m.createdAt,
  }),
};
