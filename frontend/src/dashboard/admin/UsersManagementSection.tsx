import React, { useEffect, useState } from 'react';
import { AdminApi } from '@/api/admin.api';
import toast from 'react-hot-toast';

type Row = {
  id: string; email: string; full_name: string; role: 'ADMIN'|'VENDOR'|'CUSTOMER'; created_at: string;
};

export default function UsersManagementSection() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    try {
      setLoading(true);
      const r = await AdminApi.users();
      setRows((r as Row[]) || []);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to load users';
      setError(msg);
      toast.error(msg);
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-4 p-4">
      <h3 className="text-lg font-semibold">Users</h3>
      <div className="rounded-lg border bg-white overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Role</th>
              <th className="px-4 py-2 text-left">Joined</th>
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
                <td className="px-4 py-3">{new Date(r.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
