// hooks/useProducts.ts
import { useEffect, useState, useCallback } from 'react';
import { ProductApi } from '@/api/product.api';

type Status = 'idle' | 'loading' | 'success' | 'error';

export function useProducts(limit = 20) {
  const [items, setItems] = useState<any[]>([]);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setStatus('loading');
    setError(null);
    try {
      const res = await ProductApi.list(limit);
      setItems(res.items || []);
      setStatus('success');
    } catch (e: any) {
      setError(e?.message || 'Failed to load products');
      setStatus('error');
    }
  }, [limit]);

  useEffect(() => {
    load();
  }, [load]);

  return { items, status, error, reload: load };
}

export function useProduct(slug: string | undefined) {
  const [item, setItem] = useState<any | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const ctrl = new AbortController();
    async function run() {
      if (!slug) return;
      setStatus('loading');
      setError(null);
      try {
        const res = await ProductApi.getBySlug(slug);
        if (!active) return;
        setItem(res);
        setStatus('success');
      } catch (e: any) {
        if (!active) return;
        setError(e?.message || 'Failed to load product');
        setStatus('error');
      }
    }
    run();
    return () => { active = false; ctrl.abort(); };
  }, [slug]);

  return { item, status, error };
}
