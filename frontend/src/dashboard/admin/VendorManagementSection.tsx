import React, { useEffect, useState } from 'react';
import { AdminApi } from '@/api/admin.api';
import { Button } from '@/components/common/button';
import { Badge } from '@/components/common/badge';
import toast from 'react-hot-toast';

type Row = { id: string; user_id: string; shop_name: string; slug: string; status: 'PENDING'|'APPROVED'|'SUSPENDED'; created_at: string };

export default function VendorManagementSection() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    try { setLoading(true); const r = await AdminApi.vendors(); setRows(r as any); } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function setStatus(row: Row, status: Row['status']) {
    try { await AdminApi.setVendorStatus(row.id, status); toast.success('Status updated'); await load(); } catch (e: any) { toast.error(e?.message || 'Failed'); }
  }

  return (
    <div className="space-y-4 p-4">
      <h3 className="text-lg font-semibold">Vendors</h3>
      <div className="rounded-lg border bg-white overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Shop</th>
              <th className="px-4 py-2 text-left">Slug</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="px-4 py-3" colSpan={4}>Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td className="px-4 py-3" colSpan={4}>No vendors</td></tr>
            ) : rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-4 py-3">{r.shop_name}</td>
                <td className="px-4 py-3">{r.slug}</td>
                <td className="px-4 py-3">
                  <Badge variant={r.status==='APPROVED'?'success': r.status==='PENDING'?'warning':'destructive'}>{r.status}</Badge>
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  <Button size="sm" variant="outline" onClick={() => setStatus(r,'APPROVED')}>Approve</Button>
                  <Button size="sm" variant="outline" onClick={() => setStatus(r,'PENDING')}>Pending</Button>
                  <Button size="sm" variant="destructive" onClick={() => setStatus(r,'SUSPENDED')}>Suspend</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
