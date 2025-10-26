// hooks/useNotifications.ts
import { useCallback, useEffect, useState } from 'react';
import { NotificationApi } from '@/api/notification.api';

type Status = 'idle' | 'loading' | 'success' | 'error';

export function useNotifications(token: string | undefined) {
  const [items, setItems] = useState<any[]>([]);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setStatus('loading'); setError(null);
    try {
      const res = await NotificationApi.list(token);
      setItems(res.items || []);
      setStatus('success');
    } catch (e: any) {
      setError(e?.message || 'Failed to load notifications'); setStatus('error');
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const mark = useCallback(async (id: string, isRead: boolean) => {
    if (!token) throw new Error('Missing token');
    await NotificationApi.mark(token, id, isRead);
    await load();
  }, [token, load]);

  return { items, status, error, reload: load, mark };
}
