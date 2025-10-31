import React, { useEffect, useState } from 'react';
import { VendorProductsApi } from '@/api/vendorProducts.api';

type Row = { id: string; name: string; slug: string; price_cents: number; status: 'DRAFT'|'ACTIVE'|'INACTIVE'; };

export default function InventorySection() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    try { setLoading(true); const list = await VendorProductsApi.listMine(); setRows(list as any); } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-4 p-4">
      <h3 className="text-lg font-semibold">Inventory</h3>
      <div className="rounded-lg border bg-white overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Product</th>
              <th className="px-4 py-2 text-left">Slug</th>
              <th className="px-4 py-2 text-left">Price</th>
              <th className="px-4 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="px-4 py-3" colSpan={4}>Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td className="px-4 py-3" colSpan={4}>No products</td></tr>
            ) : rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-4 py-3">{r.name}</td>
                <td className="px-4 py-3">{r.slug}</td>
                <td className="px-4 py-3">{(r.price_cents/100).toFixed(2)}</td>
                <td className="px-4 py-3">{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
