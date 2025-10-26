// routes/order.routes.ts
import { Router } from 'express';
import { authMiddleware } from '@/middleware/auth.middleware';
import { supabaseClient } from '@/config/database.config';
import { z } from 'zod';
import { validate } from '@/middleware/validation.middleware';
import { requireRole } from '@/middleware/role.middleware';

const r = Router();
r.use(authMiddleware);

// Customer orders
r.get('/me', async (req, res, next) => {
  try {
    const db = supabaseClient('anon', req.user!.jwt);
    const { data, error } = await db.from('orders').select('*').eq('customer_id', req.user!.id).order('placed_at', { ascending: false });
    if (error) throw error;
    res.json({ orders: data });
  } catch (e) { next(e); }
});

// Vendor orders
r.get('/vendor', requireRole('VENDOR'), async (req, res, next) => {
  try {
    const db = supabaseClient('anon', req.user!.jwt);
    const { data: v } = await db.from('vendors').select('id').eq('user_id', req.user!.id).single();
    const { data, error } = await db.from('orders').select('*').eq('vendor_id', v!.id).order('placed_at', { ascending: false });
    if (error) throw error;
    res.json({ orders: data });
  } catch (e) { next(e); }
});

const statusSchema = z.object({ status: z.enum(['PENDING','PROCESSING','SHIPPED','DELIVERED','CANCELLED']) });
r.patch('/:id/status', requireRole('VENDOR'), validate({ body: statusSchema }), async (req, res, next) => {
  try {
    const db = supabaseClient('anon', req.user!.jwt);
    const { data, error } = await db.from('orders').update({ status: req.body.status }).eq('id', req.params.id).select('*').single();
    if (error) throw error;
    res.json(data);
  } catch (e) { next(e); }
});

export default r;
