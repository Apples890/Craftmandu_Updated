import React, { useEffect, useMemo, useState } from 'react';
import { AdminApi } from '@/api/admin.api';
import { Button } from '@/components/common/button';
import { Input } from '@/components/common/input';
import { Label } from '@/components/common/label';
import toast from 'react-hot-toast';

type Row = { id: string; name: string; slug: string };

const slugifyName = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'category';

export default function CategoriesManagementSection() {
  const [rows, setRows] = useState<Row[]>([]);
  const [formName, setFormName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const slugPreview = useMemo(() => slugifyName(formName), [formName]);

  async function load() {
    try {
      setLoading(true);
      const res = await AdminApi.categories();
      setRows(res || []);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to load categories');
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  function resetForm() {
    setFormName('');
    setEditingId(null);
  }

  async function save() {
    const trimmed = formName.trim();
    if (!trimmed) {
      toast.error('Name is required');
      return;
    }
    try {
      if (editingId) {
        await AdminApi.updateCategory(editingId, trimmed);
        toast.success('Category updated');
      } else {
        await AdminApi.createCategory(trimmed);
        toast.success('Category created');
      }
      resetForm();
      await load();
    } catch (e: any) {
      toast.error(e?.message || 'Failed to save category');
    }
  }

  async function remove(row: Row) {
    if (!window.confirm(`Delete category "${row.name}"?`)) return;
    try {
      await AdminApi.deleteCategory(row.id);
      toast.success('Category deleted');
      if (editingId === row.id) resetForm();
      await load();
    } catch (e: any) {
      toast.error(e?.message || 'Failed to delete category');
    }
  }

  function startEdit(row: Row) {
    setEditingId(row.id);
    setFormName(row.name);
  }

  return (
    <div className="space-y-4 p-4">
      <h3 className="text-lg font-semibold">Categories</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="category-name">Name</Label>
          <Input
            id="category-name"
            placeholder="e.g. Ceramics"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
          />
          <p className="text-xs text-gray-500">Slug preview: <span className="font-mono">{slugPreview}</span></p>
        </div>
        <div className="flex items-end gap-2">
          <Button onClick={save} className="flex-1">
            {editingId ? 'Update' : 'Add'} Category
          </Button>
          {editingId && (
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
          )}
        </div>
      </div>
      <div className="rounded-lg border bg-white overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Slug</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="px-4 py-3" colSpan={3}>Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td className="px-4 py-3" colSpan={3}>No categories</td></tr>
            ) : rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-4 py-3">{r.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-600">{r.slug}</td>
                <td className="px-4 py-3 text-right space-x-2">
                  <Button size="sm" variant="outline" onClick={() => startEdit(r)}>Edit</Button>
                  <Button size="sm" variant="destructive" onClick={() => remove(r)}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}