import React, { useEffect, useState } from 'react';
import { api } from '@/utils/api.client';

type Summary = {
  revenue_cents: number;
  orders: number;
  by_status: Record<string, number>;
  series: Array<{ date: string; orders: number; revenue_cents: number }>;
};

export default function SalesAnalyticsSection() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [days, setDays] = useState<number>(30);
  const [loading, setLoading] = useState(false);

  async function load() {
    try {
      setLoading(true);
      const res = await api.get('/api/orders/vendor/summary', { params: { days } });
      setSummary(res.data as Summary);
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [days]);

  const delivered = summary?.by_status?.['DELIVERED'] || 0;
  const processing = summary?.by_status?.['PROCESSING'] || 0;
  const pending = summary?.by_status?.['PENDING'] || 0;

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Sales Analytics</h3>
        <select value={days} onChange={(e) => setDays(Number(e.target.value))} className="border rounded-md px-2 py-1 text-sm">
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
          <option value={365}>Last 365 days</option>
        </select>
      </div>
      {loading && <p className="text-sm text-gray-600">Loading…</p>}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-lg border p-4 bg-white">
          <div className="text-xs uppercase text-gray-500">Orders</div>
          <div className="text-2xl font-semibold">{summary?.orders ?? 0}</div>
        </div>
        <div className="rounded-lg border p-4 bg-white">
          <div className="text-xs uppercase text-gray-500">Revenue</div>
          <div className="text-2xl font-semibold">Nrs {(Math.round((summary?.revenue_cents || 0)/100)).toLocaleString()}</div>
        </div>
        <div className="rounded-lg border p-4 bg-white">
          <div className="text-xs uppercase text-gray-500">Delivered</div>
          <div className="text-2xl font-semibold">{delivered}</div>
        </div>
        <div className="rounded-lg border p-4 bg-white">
          <div className="text-xs uppercase text-gray-500">Processing</div>
          <div className="text-2xl font-semibold">{processing}</div>
        </div>
      </div>
      {summary?.series?.length ? (
        <div className="rounded-lg border p-4 bg-white text-sm text-gray-600">
          <div className="font-medium mb-2">Daily trend</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {summary.series.slice(-8).map((d) => (
              <div key={d.date} className="flex items-center justify-between">
                <span>{d.date}</span>
                <span>Nrs {(Math.round(d.revenue_cents/100)).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
