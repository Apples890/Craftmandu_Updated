import React, { useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { OrderApi } from '@/api/order.api';

type Row = {
  id: string;
  order_number: string | null;
  status: 'PENDING'|'PROCESSING'|'SHIPPED'|'DELIVERED'|'CANCELLED';
  placed_at: string;
};

export default function DeliverySection() {
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
        if (mounted) setRows((res.orders || []) as any);
      } finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, [token]);

  const display = useMemo(
    () => rows.filter(r => r.status === 'PENDING' || r.status === 'PROCESSING' || r.status === 'SHIPPED'),
    [rows]
  );

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Delivery Tracking</h3>
      <div className="rounded-lg border bg-white overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Order</th>
              <th className="px-4 py-2 text-left">Placed</th>
              <th className="px-4 py-2 text-left">Accepted</th>
              <th className="px-4 py-2 text-left">Out for delivery</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="px-4 py-3" colSpan={4}>Loading…</td></tr>
            ) : display.length === 0 ? (
              <tr><td className="px-4 py-3" colSpan={4}>No deliveries to show</td></tr>
            ) : (
              display.map((o) => (
                <tr key={o.id} className="border-t">
                  <td className="px-4 py-3">{o.order_number || o.id.slice(0,8)}</td>
                  <td className="px-4 py-3">{new Date(o.placed_at).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs ${(o.status === 'PROCESSING' || o.status === 'SHIPPED') ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {(o.status === 'PROCESSING' || o.status === 'SHIPPED') ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs ${o.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                      {o.status === 'SHIPPED' ? 'Yes' : 'No'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

