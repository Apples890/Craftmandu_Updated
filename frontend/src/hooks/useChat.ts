// hooks/useChat.ts
import { useCallback, useEffect, useState } from 'react';
import { ChatApi } from '@/api/chat.api';

type Status = 'idle' | 'loading' | 'success' | 'error';

export function useConversations(token: string | undefined) {
  const [items, setItems] = useState<any[]>([]);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setStatus('loading'); setError(null);
    try {
      const res = await ChatApi.listConversations(token);
      setItems(res.items || []);
      setStatus('success');
    } catch (e: any) {
      setError(e?.message || 'Failed to load conversations'); setStatus('error');
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const startConversation = useCallback(async (vendorId: string, productId?: string | null) => {
    if (!token) throw new Error('Missing token');
    const conv = await ChatApi.upsertConversation(token, vendorId, productId);
    await load();
    return conv;
  }, [token, load]);

  return { items, status, error, reload: load, startConversation };
}

export function useMessages(token: string | undefined, conversationId: string | undefined) {
  const [items, setItems] = useState<any[]>([]);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token || !conversationId) return;
    setStatus('loading'); setError(null);
    try {
      const res = await ChatApi.listMessages(token, conversationId);
      setItems(res.items || []);
      setStatus('success');
    } catch (e: any) {
      setError(e?.message || 'Failed to load messages'); setStatus('error');
    }
  }, [token, conversationId]);

  useEffect(() => { load(); }, [load]);

  const send = useCallback(async (content: string) => {
    if (!token || !conversationId) throw new Error('Missing token or conversationId');
    const msg = await ChatApi.sendMessage(token, conversationId, content);
    await load();
    return msg;
  }, [token, conversationId, load]);

  return { items, status, error, reload: load, send };
}
