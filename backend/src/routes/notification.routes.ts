// routes/notification.routes.ts
import { Router } from 'express';
import { authMiddleware } from '@/middleware/auth.middleware';
import { supabaseClient } from '@/config/database.config';
import { z } from 'zod';
import { validate } from '@/middleware/validation.middleware';

const r = Router();
r.use(authMiddleware);

r.get('/', async (req, res, next) => {
  try {
    const db = supabaseClient('anon', req.user!.jwt);
    const { data, error } = await db.from('notifications').select('*').eq('user_id', req.user!.id).order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ items: data });
  } catch (e) { next(e); }
});

const markSchema = z.object({ isRead: z.boolean() });
r.patch('/:id', validate({ body: markSchema }), async (req, res, next) => {
  try {
    const db = supabaseClient('anon', req.user!.jwt);
    const { data, error } = await db.from('notifications').update({ is_read: req.body.isRead }).eq('id', req.params.id).select('*').single();
    if (error) throw error;
    res.json(data);
  } catch (e) { next(e); }
});

export default r;
