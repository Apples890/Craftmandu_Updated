// routes/user.routes.ts
import { Router } from 'express';
import { authMiddleware } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validation.middleware';
import { z } from 'zod';
import { supabaseClient } from '@/config/database.config';

const r = Router();
r.use(authMiddleware);

r.get('/profile', async (req, res, next) => {
  try {
    const db = supabaseClient('anon', req.user!.jwt);
    const { data, error } = await db.from('users').select('*').eq('id', req.user!.id).single();
    if (error) throw error;
    res.json(data);
  } catch (e) { next(e); }
});

const updateSchema = z.object({
  fullName: z.string().min(1).max(120).optional(),
  phone: z.string().max(30).nullable().optional(),
  avatarUrl: z.string().url().nullable().optional(),
});
r.patch('/profile', validate({ body: updateSchema }), async (req, res, next) => {
  try {
    const db = supabaseClient('anon', req.user!.jwt);
    const payload: any = {};
    if (req.body.fullName !== undefined) payload.full_name = req.body.fullName;
    if (req.body.phone !== undefined) payload.phone = req.body.phone;
    if (req.body.avatarUrl !== undefined) payload.avatar_url = req.body.avatarUrl;

    const { data, error } = await db.from('users').update(payload).eq('id', req.user!.id).select('*').single();
    if (error) throw error;
    res.json(data);
  } catch (e) { next(e); }
});

export default r;
