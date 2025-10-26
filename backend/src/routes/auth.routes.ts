// routes/auth.routes.ts
import { Router } from 'express';
import { authMiddleware } from '@/middleware/auth.middleware';
import { supabaseClient } from '@/config/database.config';
import { z } from 'zod';
import { validate } from '@/middleware/validation.middleware';

const r = Router();

// Public endpoint to verify server is alive
r.get('/health', (_req, res) => res.json({ ok: true }));

// Returns user info from the JWT and optional profile from users table
r.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const db = supabaseClient('anon', req.user!.jwt);
    const { data, error } = await db.from('users').select('*').eq('id', req.user!.id).maybeSingle();
    if (error) throw error;
    res.json({ auth: req.user, profile: data });
  } catch (e) { next(e); }
});

// Optional: exchange refresh token (if you store it) or sign-in via Supabase Auth API is usually done client-side
// This placeholder shows how you might verify email existence for pre-checks
const emailSchema = z.object({ email: z.string().email() });
r.post('/precheck', validate({ body: emailSchema }), async (req, res, next) => {
  try {
    const db = supabaseClient('service');
    const { data, error } = await db.from('users').select('id').ilike('email', req.body.email).maybeSingle();
    if (error) throw error;
    res.json({ exists: Boolean(data) });
  } catch (e) { next(e); }
});

export default r;
