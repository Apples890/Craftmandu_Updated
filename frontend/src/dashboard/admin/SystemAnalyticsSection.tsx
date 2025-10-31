import React, { useEffect, useState } from 'react';
import { AdminApi } from '@/api/admin.api';
import { CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip, LineChart, Line, Legend } from 'recharts';

export default function SystemAnalyticsSection() {
  const [counts, setCounts] = useState<Record<string, number> | null>(null);
  const [days, setDays] = useState<number>(30);
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState<{ revenue_cents: number; orders: number; by_status: Record<string, number>; series: Array<{ date: string; orders: number; revenue_cents: number }>; days: number } | null>(null);

  async function load() {
    try {
      setLoading(true);
      const [c, a] = await Promise.all([AdminApi.stats(), AdminApi.analytics(days)]);
      setCounts(c); setAnalytics(a);
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [days]);

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">System Analytics</h3>
        <select value={days} onChange={(e) => setDays(Number(e.target.value))} className="border rounded-md px-2 py-1 text-sm">
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
          <option value={365}>Last 365 days</option>
        </select>
      </div>
      {loading && <p className="text-sm text-gray-600">Loading…</p>}
      {counts && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(counts).map(([k,v]) => (
            <div key={k} className="rounded-lg border p-4 bg-white">
              <div className="text-xs uppercase text-gray-500">{k}</div>
              <div className="text-2xl font-semibold">{v}</div>
            </div>
          ))}
          {analytics && (
            <>
              <div className="rounded-lg border p-4 bg-white col-span-2 md:col-span-1">
                <div className="text-xs uppercase text-gray-500">Revenue</div>
                <div className="text-2xl font-semibold">Nrs {(Math.round(analytics.revenue_cents/100)).toLocaleString()}</div>
              </div>
              <div className="rounded-lg border p-4 bg-white">
                <div className="text-xs uppercase text-gray-500">Orders</div>
                <div className="text-2xl font-semibold">{analytics.orders}</div>
              </div>
            </>
          )}
        </div>
      )}
      {analytics && (
        <div className="h-64 bg-white rounded-lg border p-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analytics.series}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(v: any, n: any) => n === 'revenue_cents' ? `Nrs ${(Math.round(Number(v)/100)).toLocaleString()}` : v} />
              <Legend />
              <Line type="monotone" dataKey="orders" stroke="#ef4444" name="Orders" />
              <Line type="monotone" dataKey="revenue_cents" stroke="#10b981" name="Revenue (cents)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
