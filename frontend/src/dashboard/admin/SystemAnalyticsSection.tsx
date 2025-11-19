import React, { useEffect, useState } from 'react';
import { AdminApi } from '@/api/admin.api';
import { CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip, LineChart, Line, Legend } from 'recharts';

export default function SystemAnalyticsSection() {
  const [counts, setCounts] = useState<Record<string, number> | null>(null);
  const [days, setDays] = useState<number>(30);
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState<{ revenue_cents: number; orders: number; by_status: Record<string, number>; series: Array<{ date: string; orders: number; revenue_cents: number }>; days: number } | null>(null);
  const [reviewStats, setReviewStats] = useState<{ total: number; averageRating: number; breakdown: Record<string, number>; topProducts: Array<{ productId: string; name: string; slug: string; averageRating: number; reviewCount: number }> } | null>(null);

  async function load() {
    try {
      setLoading(true);
      const [c, a, r] = await Promise.all([AdminApi.stats(), AdminApi.analytics(days), AdminApi.reviewStats()]);
      setCounts(c); setAnalytics(a); setReviewStats(r);
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
          {reviewStats && (
            <>
              <div className="rounded-lg border p-4 bg-white">
                <div className="text-xs uppercase text-gray-500">Avg Rating</div>
                <div className="text-2xl font-semibold">{reviewStats.averageRating}★</div>
              </div>
              <div className="rounded-lg border p-4 bg-white">
                <div className="text-xs uppercase text-gray-500">Total Reviews</div>
                <div className="text-2xl font-semibold">{reviewStats.total}</div>
              </div>
            </>
          )}
        </div>
      )}
      {reviewStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg border p-4">
            <h4 className="text-sm font-semibold mb-3">Rating Breakdown</h4>
            <div className="space-y-2 text-sm text-gray-600">
              {[5,4,3,2,1].map((n) => (
                <div key={n} className="flex items-center gap-2">
                  <span className="font-medium">{n}★</span>
                  <div className="w-40 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-2 bg-yellow-400"
                      style={{ width: `${reviewStats.total ? ((reviewStats.breakdown[String(n)] || 0) / reviewStats.total) * 100 : 0}%` }}
                    />
                  </div>
                  <span>{reviewStats.breakdown[String(n)] || 0}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <h4 className="text-sm font-semibold mb-3">Top Rated Products</h4>
            {reviewStats.topProducts.length === 0 ? (
              <p className="text-sm text-gray-600">No reviews yet.</p>
            ) : (
              <div className="space-y-2 text-sm text-gray-700">
                {reviewStats.topProducts.map((p) => (
                  <div key={p.productId} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-gray-500">{p.reviewCount} reviews</div>
                    </div>
                    <div className="text-sm font-semibold">{p.averageRating}★</div>
                  </div>
                ))}
              </div>
            )}
          </div>
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
