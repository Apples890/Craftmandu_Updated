// api/chat.api.ts
import { request } from './_base';

export const ChatApi = {
  upsertConversation(token: string, vendorId: string, productId?: string | null) {
    return request<any>('/api/chat/conversations', 'POST', { vendorId, productId: productId ?? null }, token);
  },
  listConversations(token: string) {
    return request<{ items: any[] }>('/api/chat/conversations', 'GET', undefined, token);
  },
  sendMessage(token: string, conversationId: string, content: string) {
    return request<any>('/api/chat/messages', 'POST', { conversationId, content }, token);
  },
  listMessages(token: string, conversationId: string) {
    return request<{ items: any[] }>(`/api/chat/messages/${conversationId}`, 'GET', undefined, token);
  },
};
