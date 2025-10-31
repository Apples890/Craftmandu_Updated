import React, { useEffect, useState } from 'react';
import { AdminApi } from '@/api/admin.api';
import { api } from '@/utils/api.client';
import { Button } from '@/components/common/button';
import { Input } from '@/components/common/input';
import { Label } from '@/components/common/label';
import toast from 'react-hot-toast';

type Row = { id: string; name: string; slug: string };

export default function CategoriesManagementSection() {
  const [rows, setRows] = useState<Row[]>([]);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(false);

  async function load() {
    try {
      setLoading(true);
      const res = await api.get('/api/products/categories');
      setRows((res.data?.items || []) as Row[]);
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function create() {
    try {
      if (!name.trim() || !slug.trim()) { toast.error('Name and slug required'); return; }
      await AdminApi.createCategory(name.trim(), slug.trim());
      toast.success('Category created');
      setName(''); setSlug('');
      await load();
    } catch (e: any) { toast.error(e?.message || 'Failed'); }
  }

  return (
    <div className="space-y-4 p-4">
      <h3 className="text-lg font-semibold">Categories</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
        </div>
        <div className="flex items-end">
          <Button onClick={create}>Add Category</Button>
        </div>
      </div>
      <div className="rounded-lg border bg-white overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Slug</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="px-4 py-3" colSpan={2}>Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td className="px-4 py-3" colSpan={2}>No categories</td></tr>
            ) : rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-4 py-3">{r.name}</td>
                <td className="px-4 py-3">{r.slug}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

