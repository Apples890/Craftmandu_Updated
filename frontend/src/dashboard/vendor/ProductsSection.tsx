import React, { useEffect, useMemo, useRef, useState } from 'react';
import { VendorProductsApi } from '@/api/vendorProducts.api';
import { Button } from '@/components/common/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/common/dialog';
import { Input } from '@/components/common/input';
import { Label } from '@/components/common/label';
import { Badge } from '@/components/common/badge';
import { Camera, Plus, Pencil, Trash2, Upload, CheckCircle2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/utils/api.client';

type Row = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  price_cents: number;
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE';
  created_at: string;
  updated_at: string;
};

export default function ProductsSection() {
  const [items, setItems] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [status, setStatus] = useState<'DRAFT'|'ACTIVE'|'INACTIVE'>('DRAFT');
  const [file, setFile] = useState<File | null>(null);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [categoryId, setCategoryId] = useState<string | ''>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const uploadProductIdRef = useRef<string | null>(null);

  function resetForm() {
    setEditing(null);
    setName(''); setSlug(''); setDescription(''); setPrice(0); setStatus('DRAFT');
  }

  async function load() {
    setLoading(true);
    try {
      const rows = await VendorProductsApi.listMine();
      setItems(rows);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to load products');
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    (async () => {
      try { const res = await api.get('/api/products/categories'); setCategories((res.data?.items || []).map((c: any) => ({ id: c.id, name: c.name }))); } catch {}
    })();
  }, []);

  const statusBadge = (s: Row['status']) => (
    <Badge variant={s === 'ACTIVE' ? 'success' : s === 'DRAFT' ? 'neutral' : 'outline'} className="uppercase text-[10px]">
      {s}
    </Badge>
  );

  async function onSubmit() {
    try {
      if (!name.trim() || !slug.trim()) { toast.error('Name and slug are required'); return; }
      if (!editing && !file) { toast.error('Please select a product image'); return; }
      if (editing) {
        await VendorProductsApi.update(editing.id, { name, slug, description, price, status, categoryId: categoryId || null });
        toast.success('Product updated');
      } else {
        const created = await VendorProductsApi.create({ name, slug, description, price, status, categoryId: categoryId || null });
        toast.success('Product created');
        if (file) {
          await VendorProductsApi.uploadImage(created.id, file);
          toast.success('Image uploaded');
        }
      }
      setOpenForm(false); resetForm();
      await load();
    } catch (e: any) { toast.error(e?.message || 'Save failed'); }
  }

  async function onDelete(row: Row) {
    if (!confirm('Delete this product?')) return;
    try { await VendorProductsApi.remove(row.id); toast.success('Deleted'); await load(); } catch (e: any) { toast.error(e?.message || 'Delete failed'); }
  }

  async function onToggle(row: Row) {
    const next = row.status === 'ACTIVE' ? 'DRAFT' : 'ACTIVE';
    try { await VendorProductsApi.update(row.id, { status: next }); toast.success(next === 'ACTIVE' ? 'Published' : 'Unpublished'); await load(); } catch (e: any) { toast.error(e?.message || 'Update failed'); }
  }

  function chooseImage(row: Row) {
    uploadProductIdRef.current = row.id;
    fileInputRef.current?.click();
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !uploadProductIdRef.current) return;
    try {
      await VendorProductsApi.uploadImage(uploadProductIdRef.current, file);
      toast.success('Image uploaded');
      await load();
    } catch (e: any) { toast.error(e?.message || 'Upload failed'); }
    finally { if (fileInputRef.current) fileInputRef.current.value = ''; uploadProductIdRef.current = null; }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Products</h3>
        <Button onClick={() => { resetForm(); setOpenForm(true); }}><Plus className="h-4 w-4" /> New product</Button>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />

      <div className="rounded-lg border bg-white">
        <div className="grid grid-cols-12 px-4 py-2 text-xs font-medium text-gray-500 border-b">
          <div className="col-span-1">Image</div>
          <div className="col-span-3">Name</div>
          <div className="col-span-2">Slug</div>
          <div className="col-span-2">Price</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>
        {loading ? (
          <div className="p-4 text-sm text-gray-500">Loading…</div>
        ) : items.length === 0 ? (
          <div className="p-4 text-sm text-gray-500">No products yet. Click "New product" to create your first item.</div>
        ) : (
          items.map((row) => (
            <div key={row.id} className="grid grid-cols-12 px-4 py-3 items-center border-t">
              <div className="col-span-1">
                { (row as any).product_images?.length ? (
                  <img src={(row as any).product_images[0]?.image_url} alt="thumb" className="h-10 w-10 rounded object-cover border" />
                ) : (
                  <div className="h-10 w-10 rounded bg-gray-100 border" />
                )}
              </div>
              <div className="col-span-3">
                <div className="font-medium text-gray-900">{row.name}</div>
                <div className="text-xs text-gray-500">Updated {new Date(row.updated_at).toLocaleDateString()}</div>
              </div>
              <div className="col-span-2 text-sm text-gray-700 truncate">{row.slug}</div>
              <div className="col-span-2 text-sm text-gray-900">{(row.price_cents/100).toFixed(2)}</div>
              <div className="col-span-2">{statusBadge(row.status)}</div>
              <div className="col-span-2 flex justify-end gap-2">
                <Button size="sm" variant="outline" onClick={() => chooseImage(row)} title="Upload image"><Upload className="h-4 w-4" /></Button>
                <Button size="sm" variant="outline" onClick={() => { setEditing(row); setName(row.name); setSlug(row.slug); setDescription(row.description || ''); setPrice(row.price_cents/100); setStatus(row.status); setOpenForm(true); }} title="Edit"><Pencil className="h-4 w-4" /></Button>
                <Button size="sm" variant={row.status === 'ACTIVE' ? 'destructive' : 'secondary'} onClick={() => onToggle(row)} title={row.status==='ACTIVE'?'Unpublish':'Publish'}>
                  {row.status==='ACTIVE'? <XCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                </Button>
                <Button size="sm" variant="destructive" onClick={() => onDelete(row)} title="Delete"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog open={openForm} onOpenChange={setOpenForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit product' : 'Create product'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="desc">Description</Label>
              <textarea id="desc" className="w-full border rounded-md p-2 h-24" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
                <div>
                  <Label htmlFor="price">Price</Label>
                  <Input id="price" type="number" step="0.01" min="0" value={isNaN(price)? '': String(price)} onChange={(e) => setPrice(parseFloat(e.target.value))} />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <select id="status" className="w-full border rounded-md h-10 px-2" value={status} onChange={(e) => setStatus(e.target.value as any)}>
                    <option value="DRAFT">Draft</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <select id="category" className="w-full border rounded-md h-10 px-2" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                    <option value="">Uncategorized</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                {!editing && (
                  <div className="md:col-span-2">
                    <Label htmlFor="image">Main image</Label>
                    <input id="image" type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="block w-full border rounded-md p-2" />
                  </div>
                )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenForm(false)}>Cancel</Button>
            <Button onClick={onSubmit}>{editing ? 'Save changes' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
