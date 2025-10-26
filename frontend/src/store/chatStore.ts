// store/chatStore.ts
import { create } from 'zustand';
import { ChatApi } from '@/api/chat.api';

type ChatState = {
  conversations: any[];
  messages: Record<string, any[]>; // keyed by conversationId
  loading: boolean;
  error?: string | null;
  loadConversations: (token: string) => Promise<void>;
  loadMessages: (token: string, conversationId: string) => Promise<void>;
  sendMessage: (token: string, conversationId: string, content: string) => Promise<void>;
  startConversation: (token: string, vendorId: string, productId?: string | null) => Promise<any>;
  clear: () => void;
};

export const useChatStore = create<ChatState>()((set, get) => ({
  conversations: [],
  messages: {},
  loading: false,
  error: null,
  async loadConversations(token) {
    set({ loading: true, error: null });
    try {
      const { items } = await ChatApi.listConversations(token);
      set({ conversations: items, loading: false });
    } catch (e: any) {
      set({ loading: false, error: e?.message || 'Failed to load conversations' });
    }
  },
  async loadMessages(token, conversationId) {
    set({ loading: true, error: null });
    try {
      const { items } = await ChatApi.listMessages(token, conversationId);
      set((state) => ({ messages: { ...state.messages, [conversationId]: items }, loading: false }));
    } catch (e: any) {
      set({ loading: false, error: e?.message || 'Failed to load messages' });
    }
  },
  async sendMessage(token, conversationId, content) {
    await ChatApi.sendMessage(token, conversationId, content);
    await get().loadMessages(token, conversationId);
  },
  async startConversation(token, vendorId, productId) {
    const conv = await ChatApi.upsertConversation(token, vendorId, productId);
    await get().loadConversations(token);
    return conv;
  },
  clear() {
    set({ conversations: [], messages: {}, loading: false, error: null });
  },
}));
