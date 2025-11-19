import React, { useEffect, useState } from 'react';
import { ReviewApi, VendorReview } from '@/api/review.api';
import { Star } from 'lucide-react';
import toast from 'react-hot-toast';

export default function VendorReviewsSection() {
  const [reviews, setReviews] = useState<VendorReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  async function load() {
    setLoading(true);
    try {
      const list = await ReviewApi.vendorList();
      setReviews(list);
      setDraft({});
    } catch (e: any) {
      toast.error(e?.message || 'Failed to load reviews');
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function submitReply(id: string) {
    const text = (draft[id] || '').trim();
    if (!text) { toast.error('Reply cannot be empty'); return; }
    try {
      setSaving((prev) => ({ ...prev, [id]: true }));
      await ReviewApi.reply(id, text);
      toast.success('Reply saved');
      await load();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || e?.message || 'Failed to save reply');
    } finally {
      setSaving((prev) => ({ ...prev, [id]: false }));
    }
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Customer Reviews</h3>
        <button className="text-sm text-primary" onClick={load}>Refresh</button>
      </div>
      {loading ? (
        <p className="text-gray-600">Loading reviews…</p>
      ) : reviews.length === 0 ? (
        <p className="text-gray-600">No reviews yet.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{r.product?.name || 'Product'}</div>
                  <div className="text-xs text-gray-500">{r.customer?.full_name || r.customer?.email || 'Customer'}</div>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < (Number(r.rating)||0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                  ))}
                </div>
              </div>
              {r.title && <div className="font-semibold">{r.title}</div>}
              {r.comment && <div className="text-sm text-gray-700">{r.comment}</div>}
              <div className="text-xs text-gray-500">{new Date(r.created_at).toLocaleString()}</div>
              {r.vendor_reply ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm">
                  <div className="text-xs uppercase text-gray-500 mb-1">Your reply</div>
                  <p>{r.vendor_reply}</p>
                  {r.vendor_reply_at && (
                    <div className="text-xs text-gray-500 mt-1">{new Date(r.vendor_reply_at).toLocaleString()}</div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <textarea
                    className="input-field"
                    rows={3}
                    placeholder="Write a reply to this customer…"
                    value={draft[r.id] || ''}
                    onChange={(e) => setDraft((prev) => ({ ...prev, [r.id]: e.target.value }))}
                  />
                  <button
                    className="btn-primary"
                    disabled={saving[r.id]}
                    onClick={() => submitReply(r.id)}
                  >
                    {saving[r.id] ? 'Sending…' : 'Send reply'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
