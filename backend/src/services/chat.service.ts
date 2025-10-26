// services/chat.service.ts
import { supabaseClient } from '@/config/database.config';
import { BadRequestError } from '@/utils/error.utils';
import type { ConversationDbRow, MessageDbRow } from '@/types/chat.types';

export const ChatService = {
  async upsertConversation(userId: string, jwt: string, vendorId: string, productId?: string | null) {
    const db = supabaseClient('anon', jwt);
    const { data, error } = await db.from<ConversationDbRow>('conversations')
      .upsert({ customer_id: userId, vendor_id: vendorId, product_id: productId ?? null }, { onConflict: 'customer_id,vendor_id,product_id' })
      .select('*').single();
    if (error) throw new BadRequestError(error.message);
    return data;
  },

  async listConversations(userId: string, jwt: string) {
    const db = supabaseClient('anon', jwt);
    const { data, error } = await db.from<ConversationDbRow>('conversations').select('*').eq('customer_id', userId).order('created_at', { ascending: false });
    if (error) throw new BadRequestError(error.message);
    return data;
  },

  async sendMessage(userId: string, jwt: string, conversationId: string, content: string) {
    const db = supabaseClient('anon', jwt);
    const { data, error } = await db.from<MessageDbRow>('messages').insert({ conversation_id: conversationId, sender_id: userId, content }).select('*').single();
    if (error) throw new BadRequestError(error.message);
    return data;
  },

  async listMessages(jwt: string, conversationId: string) {
    const db = supabaseClient('anon', jwt);
    const { data, error } = await db.from<MessageDbRow>('messages').select('*').eq('conversation_id', conversationId).order('created_at', { ascending: true });
    if (error) throw new BadRequestError(error.message);
    return data;
  },
};
