import React, { useEffect, useState } from 'react';
import { AdminApi } from '@/api/admin.api';
import { Button } from '@/components/common/button';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

type Row = { id: string; email: string; full_name: string; role: 'ADMIN'|'VENDOR'|'CUSTOMER'; is_banned?: boolean };

export default function BannedUsersPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function load() {
    setError(null);
    try {
      setLoading(true);
      const r = await AdminApi.users();
      setRows((r as any[]).filter((u) => u.is_banned));
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to load users';
      setError(msg);
      toast.error(msg);
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function unbanUser(row: Row) {
    try {
      await AdminApi.banUser(row.id, { banned: false, until: null });
      toast.success('User unbanned');
      await load();
    } catch (e: any) { toast.error(e?.message || 'Failed'); }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Banned Users</h1>
          <Button variant="outline" onClick={() => navigate('/admin')}>Back to Admin</Button>
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
                <tr><td className="px-4 py-3" colSpan={4}>No banned users</td></tr>
              ) : rows.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="px-4 py-3">{r.email}</td>
                  <td className="px-4 py-3">{r.full_name}</td>
                  <td className="px-4 py-3">{r.role}</td>
                  <td className="px-4 py-3">
                    <Button size="sm" variant="secondary" onClick={() => unbanUser(r)}>Unban</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
