// hooks/useOrders.ts
import { useCallback, useEffect, useState } from 'react';
import { OrderApi, OrderStatus } from '@/api/order.api';

type Status = 'idle' | 'loading' | 'success' | 'error';

export function useOrders(token: string | undefined, mode: 'me' | 'vendor' = 'me') {
  const [orders, setOrders] = useState<any[]>([]);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setStatus('loading'); setError(null);
    try {
      const res = mode === 'vendor' ? await OrderApi.listVendor(token) : await OrderApi.listMine(token);
      setOrders(res.orders || []);
      setStatus('success');
    } catch (e: any) {
      setError(e?.message || 'Failed to load orders'); setStatus('error');
    }
  }, [token, mode]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = useCallback(async (id: string, status: OrderStatus) => {
    if (!token) throw new Error('Missing token');
    await OrderApi.updateStatus(token, id, status);
    await load();
  }, [token, load]);

  return { orders, status, error, reload: load, updateStatus };
}
