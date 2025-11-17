import React, { useEffect, useMemo, useState } from 'react';
import { ReviewApi, Review } from '@/api/review.api';
import { Star } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

type Props = { productId?: string; productSlug?: string };

export default function ReviewsSection({ productId, productSlug }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  async function load() {
    setLoading(true);
    try {
      let list: Review[] = [];
      const uuidRe = /^[0-9a-fA-F-]{36}$/;
      if (productSlug) {
        list = await ReviewApi.listByProductSlug(productSlug);
      } else if (productId && uuidRe.test(productId)) {
        list = await ReviewApi.listByProductId(productId);
      } else if (productId) {
        list = await ReviewApi.listByProductSlug(productId);
      }
      setReviews(list);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to load reviews');
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [productId, productSlug]);

  const avg = useMemo(() => {
    if (!reviews.length) return 0;
    return Math.round((reviews.reduce((s, r) => s + (Number(r.rating) || 0), 0) / reviews.length) * 10) / 10;
  }, [reviews]);

  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!productId) { toast.error('Missing product id'); return; }
    try {
      setSaving(true);
      await ReviewApi.create({ productId, rating, title: title || undefined, comment: comment || undefined });
      toast.success('Review submitted');
      setOpen(false); setTitle(''); setComment(''); setRating(5);
      await load();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || e?.message || 'Unable to submit review');
    } finally { setSaving(false); }
  }

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-xl font-semibold">Reviews</span>
          <span className="text-sm text-gray-600">{reviews.length} reviews • {avg}★</span>
        </div>
        {user && productId && (
          <button className="btn-primary" onClick={() => setOpen(!open)}>{open ? 'Cancel' : 'Write a review'}</button>
        )}
      </div>

      {open && (
        <div className="card p-4 mb-6 space-y-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700">Rating</label>
            <select value={rating} onChange={(e) => setRating(Number(e.target.value))} className="border rounded px-2 py-1 text-sm">
              {[5,4,3,2,1].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title (optional)" className="input-field" />
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share your experience" className="input-field" rows={4} />
          <div>
            <button disabled={saving} className="btn-primary" onClick={submit}>{saving ? 'Submitting…' : 'Submit Review'}</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-gray-600">Loading…</div>
      ) : reviews.length === 0 ? (
        <div className="text-gray-600">No reviews yet</div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="card p-4">
              <div className="flex items-center gap-2 mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < (Number(r.rating)||0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                ))}
                <span className="text-xs text-gray-500 ml-2">{new Date(r.created_at).toLocaleDateString()}</span>
              </div>
              {r.title && <div className="font-medium mb-1">{r.title}</div>}
              {r.comment && <div className="text-gray-700 text-sm">{r.comment}</div>}
              {r.order_id && <div className="mt-2 text-xs text-green-700">Verified purchase</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
