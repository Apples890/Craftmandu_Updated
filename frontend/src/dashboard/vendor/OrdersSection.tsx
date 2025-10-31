import React, { useEffect, useState } from 'react';
import { api } from '@/utils/api.client';
import { Button } from '@/components/common/button';
import toast from 'react-hot-toast';

type Order = { id: string; order_number: string | null; status: 'PENDING'|'PROCESSING'|'SHIPPED'|'DELIVERED'|'CANCELLED'; total_cents: number; currency: string; placed_at: string };

export default function OrdersSection() {
  const [rows, setRows] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    try { setLoading(true); const res = await api.get('/api/orders/vendor'); setRows(res.data?.orders || []); } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function updateStatus(id: string, status: Order['status']) {
    try { await api.patch(`/api/orders/${id}/status`, { status }); toast.success('Updated'); await load(); } catch (e: any) { toast.error(e?.message || 'Failed'); }
  }

  return (
    <div className="space-y-4 p-4">
      <h3 className="text-lg font-semibold">Orders</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">Total Orders</p>
          <p className="text-2xl font-bold">{rows.length}</p>
        </div>
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">Open</p>
          <p className="text-2xl font-bold">{rows.filter(r => r.status !== 'DELIVERED' && r.status !== 'CANCELLED').length}</p>
        </div>
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">Revenue</p>
          <p className="text-2xl font-bold"><span className="text-gray-600 mr-1">Nrs</span>{Math.round(rows.reduce((s, r) => s + (r.total_cents||0), 0)/100).toLocaleString()}</p>
        </div>
      </div>
      <div className="rounded-lg border bg-white overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Order</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Total</th>
              <th className="px-4 py-2 text-left">Placed</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="px-4 py-3" colSpan={5}>Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td className="px-4 py-3" colSpan={5}>No orders</td></tr>
            ) : rows.map((o) => (
              <tr key={o.id} className="border-t">
                <td className="px-4 py-3">{o.order_number || o.id.slice(0,8)}</td>
                <td className="px-4 py-3">{o.status}</td>
                <td className="px-4 py-3"><span className="text-gray-600 mr-1">Nrs</span>{(o.total_cents/100).toLocaleString()}</td>
                <td className="px-4 py-3">{new Date(o.placed_at).toLocaleString()}</td>
                <td className="px-4 py-3 text-right space-x-2">
                  <Button size="sm" variant="outline" onClick={() => updateStatus(o.id,'PROCESSING')}>Process</Button>
                  <Button size="sm" variant="outline" onClick={() => updateStatus(o.id,'SHIPPED')}>Ship</Button>
                  <Button size="sm" variant="secondary" onClick={() => updateStatus(o.id,'DELIVERED')}>Deliver</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
