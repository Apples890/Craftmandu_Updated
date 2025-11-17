// routes/chat.routes.ts
import { Router } from 'express';
import { authMiddleware } from '@/middleware/auth.middleware';
import { supabaseClient } from '@/config/database.config';
import { z } from 'zod';
import { validate } from '@/middleware/validation.middleware';
import { requireNotBanned } from '@/middleware/moderation.middleware';

const r = Router();
r.use(authMiddleware);

// Create or get conversation
const convSchema = z.object({
  vendorId: z.string().uuid(),
  productId: z.string().uuid().nullable().optional(),
});
r.post('/conversations', requireNotBanned(), validate({ body: convSchema }), async (req, res, next) => {
  try {
    const db = supabaseClient('service');
    const { data, error } = await db
      .from('conversations')
      .upsert(
        {
          customer_id: req.user!.id,
          vendor_id: req.body.vendorId,
          product_id: req.body.productId ?? null,
        },
        { onConflict: 'customer_id,vendor_id,product_id' }
      )
      .select('*')
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (e) { next(e); }
});

// List conversations for current user (customer or vendor)
r.get('/conversations', requireNotBanned(), async (req, res, next) => {
  try {
    const db = supabaseClient('service');
    const { data: vend } = await db.from('vendors').select('id').eq('user_id', req.user!.id).maybeSingle();
    let q = db
      .from('conversations')
      .select('id, customer_id, vendor_id, product_id, created_at')
      .order('created_at', { ascending: false });
    if (vend?.id) {
      q = q.or(`customer_id.eq.${req.user!.id},vendor_id.eq.${vend.id}`);
    } else {
      q = q.eq('customer_id', req.user!.id);
    }
    const { data, error } = await q;
    if (error) throw error;

    const items = data || [];
    const vendorIds = Array.from(new Set(items.map((c: any) => c.vendor_id)));
    const customerIds = Array.from(new Set(items.map((c: any) => c.customer_id)));
    const vendorMap: Record<string, any> = {};
    const customerMap: Record<string, any> = {};
    if (vendorIds.length) {
      const { data: vrows } = await db.from('vendors').select('id, shop_name, logo_url').in('id', vendorIds);
      (vrows || []).forEach((v: any) => (vendorMap[v.id] = v));
    }
    if (customerIds.length) {
      const { data: crows } = await db.from('users').select('id, full_name, email, avatar_url').in('id', customerIds);
      (crows || []).forEach((u: any) => (customerMap[u.id] = u));
    }
    const enriched = items.map((c: any) => ({
      ...c,
      vendor: vendorMap[c.vendor_id] || null,
      customer: customerMap[c.customer_id] || null,
    }));
    res.json({ items: enriched });
  } catch (e) { next(e); }
});

const messageSchema = z.object({
  conversationId: z.string().uuid(),
  content: z.string().min(1).max(4000),
});
r.post('/messages', requireNotBanned(), validate({ body: messageSchema }), async (req, res, next) => {
  try {
    const db = supabaseClient('service');
    const { data, error } = await db
      .from('messages')
      .insert({
        conversation_id: req.body.conversationId,
        sender_id: req.user!.id,
        content: req.body.content,
      })
      .select('*')
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (e) { next(e); }
});

r.get('/messages/:conversationId', requireNotBanned(), async (req, res, next) => {
  try {
    const db = supabaseClient('service');
    const { data, error } = await db
      .from('messages')
      .select('*')
      .eq('conversation_id', req.params.conversationId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    res.json({ items: data });
  } catch (e) { next(e); }
});

export default r;
