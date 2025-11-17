import React, { useEffect, useMemo, useState } from 'react';
import { AdminApi } from '@/api/admin.api';
import { Button } from '@/components/common/button';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

type Row = {
  id: string; email: string; full_name: string; role: 'ADMIN'|'VENDOR'|'CUSTOMER'; created_at: string;
  is_banned?: boolean;
};

export default function UsersManagementSection() {
  const [rows, setRows] = useState<Row[]>([]);
  const [vendors, setVendors] = useState<Array<{ id: string; user_id: string; shop_name: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function load() {
    setError(null);
    try {
      setLoading(true);
      const [r, v] = await Promise.all([AdminApi.users(), AdminApi.vendors()]);
      setRows(r as any);
      // AdminApi.vendors() returns an array of vendors
      setVendors((v as any) || []);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to load users';
      setError(msg);
      toast.error(msg);
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);
  const vendorByUserId = useMemo(() => {
    const map: Record<string, { id: string; shop_name: string }> = {};
    (vendors || []).forEach((x: any) => { map[x.user_id] = { id: x.id, shop_name: x.shop_name }; });
    return map;
  }, [vendors]);

  async function toggleBan(row: Row) {
    const banned = !row.is_banned;
    try {
      await AdminApi.banUser(row.id, { banned, until: null });
      toast.success(banned ? 'User banned' : 'User unbanned');
      await load();
    } catch (e: any) { toast.error(e?.message || 'Failed'); }
  }
  // per-action restrictions removed; only is_banned is enforced
  async function createVendor(row: Row) {
    const name = window.prompt('Enter shop name', row.full_name || '');
    if (name === null) return;
    try {
      await AdminApi.promoteToVendor(row.id, name || undefined);
      toast.success('Vendor created');
      await load();
    } catch (e: any) { toast.error(e?.message || 'Failed'); }
  }
  async function deleteVendor(row: Row) {
    const v = vendorByUserId[row.id];
    if (!v?.id) { toast.error('Vendor not found for user'); return; }
    if (!window.confirm(`Delete vendor "${v.shop_name}"?`)) return;
    try { await AdminApi.deleteVendor(v.id); toast.success('Vendor deleted'); await load(); } catch (e: any) { toast.error(e?.message || 'Failed'); }
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Users</h3>
        <Button size="sm" variant="outline" onClick={() => navigate('/admin/banned-users')}>View Banned Users</Button>
      </div>
      <div className="rounded-lg border bg-white overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Role</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="px-4 py-3" colSpan={4}>Loading…</td></tr>
            ) : error ? (
              <tr><td className="px-4 py-3 text-red-600" colSpan={4}>Error: {error}</td></tr>
            ) : rows.length === 0 ? (
              <tr><td className="px-4 py-3" colSpan={4}>No users</td></tr>
            ) : rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-4 py-3">{r.email}</td>
                <td className="px-4 py-3">{r.full_name}</td>
                <td className="px-4 py-3">{r.role}</td>
                <td className="px-4 py-3 space-x-2">
                  <Button size="sm" variant={r.is_banned ? 'secondary' : 'outline'} onClick={() => toggleBan(r)}>
                    {r.is_banned ? 'Unban' : 'Ban'}
                  </Button>
                  {vendorByUserId[r.id]?.id ? (
                    <Button size="sm" variant="outline" onClick={() => deleteVendor(r)}>Delete Vendor</Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => createVendor(r)}>Create Vendor</Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
