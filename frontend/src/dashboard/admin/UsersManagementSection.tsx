import React, { useEffect, useState } from 'react';
import { AdminApi } from '@/api/admin.api';
import { Button } from '@/components/common/button';
import toast from 'react-hot-toast';

type Row = { id: string; email: string; full_name: string; role: 'ADMIN'|'VENDOR'|'CUSTOMER'; created_at: string };

export default function UsersManagementSection() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    try { setLoading(true); const r = await AdminApi.users(); setRows(r as any); } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function updateRole(row: Row, role: Row['role']) {
    try { await AdminApi.setUserRole(row.id, role); toast.success('Role updated'); await load(); } catch (e: any) { toast.error(e?.message || 'Failed'); }
  }

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
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="px-4 py-3" colSpan={4}>Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td className="px-4 py-3" colSpan={4}>No users</td></tr>
            ) : rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-4 py-3">{r.email}</td>
                <td className="px-4 py-3">{r.full_name}</td>
                <td className="px-4 py-3">{r.role}</td>
                <td className="px-4 py-3 text-right space-x-2">
                  <Button size="sm" variant={r.role==='ADMIN'?'secondary':'outline'} onClick={() => updateRole(r,'ADMIN')}>Make Admin</Button>
                  <Button size="sm" variant={r.role==='VENDOR'?'secondary':'outline'} onClick={() => updateRole(r,'VENDOR')}>Vendor</Button>
                  <Button size="sm" variant={r.role==='CUSTOMER'?'secondary':'outline'} onClick={() => updateRole(r,'CUSTOMER')}>Customer</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
