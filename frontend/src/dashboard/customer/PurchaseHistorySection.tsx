import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { OrderApi } from '@/api/order.api';

type Row = { id: string; order_number: string | null; status: 'PENDING'|'PROCESSING'|'SHIPPED'|'DELIVERED'|'CANCELLED'; total_cents: number; placed_at: string; };

export default function PurchaseHistorySection() {
  const token = useAuthStore((s) => s.token);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        if (!token) { setRows([]); return; }
        const res = await OrderApi.listMine(token);
        if (mounted) setRows(res.orders || []);
      } catch {
        if (mounted) setRows([]);
      } finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, [token]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Purchase History</h3>
      <div className="rounded-lg border bg-white overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Order</th>
              <th className="px-4 py-2 text-left">Placed</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Total</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="px-4 py-3" colSpan={4}>Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td className="px-4 py-3" colSpan={4}>No orders yet</td></tr>
            ) : (
              rows.map((o) => (
                <tr key={o.id} className="border-t">
                  <td className="px-4 py-3">{o.order_number || o.id.slice(0,8)}</td>
                  <td className="px-4 py-3">{new Date(o.placed_at).toLocaleString()}</td>
                  <td className="px-4 py-3">{o.status}</td>
                  <td className="px-4 py-3"><span className="text-gray-600 mr-1">Nrs</span>{Math.round((o.total_cents||0)/100).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
