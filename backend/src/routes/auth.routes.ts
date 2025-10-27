// routes/auth.routes.ts
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { authMiddleware } from '@/middleware/auth.middleware';
import { supabaseClient } from '@/config/database.config';
import { z } from 'zod';
import { validate } from '@/middleware/validation.middleware';
import { AuthController } from '@/controllers/auth.controller';
import { loginSchema, registerSchema } from '@/validators/auth.validator';
import { signInternalJwt } from '@/utils/jwt.utils';

const r = Router();

// Public endpoint to verify server is alive
r.get('/health', (_req, res) => res.json({ ok: true }));

// Public auth endpoints
r.post('/register', validate({ body: registerSchema }), AuthController.register);
r.post('/login', validate({ body: loginSchema }), AuthController.login);

// Returns user info from the JWT and optional profile from users table
r.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const db = supabaseClient('anon', req.user!.jwt);
    const { data, error } = await db.from('users').select('*').eq('id', req.user!.id).maybeSingle();
    if (error) throw error;
    res.json({ auth: req.user, profile: data });
  } catch (e) { next(e); }
});

// Internal token session endpoint (for tokens issued by our server)
// Authorization: Bearer <internal-jwt>
r.get('/session', async (req, res, next) => {
  try {
    const auth = req.header('authorization');
    if (!auth || !auth.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing or invalid Authorization header' });
      return;
    }
    const token = auth.slice(7);
    const secret = process.env.INTERNAL_JWT_SECRET || 'dev_secret';
    const payload = jwt.verify(token, secret) as any;
    const userId = payload?.id as string | undefined;
    if (!userId) { res.status(401).json({ error: 'Invalid token payload' }); return; }

    const db = supabaseClient('service');
    const { data, error } = await db
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    if (error) throw error;
    res.json({ profile: data });
    return;
  } catch (e) { next(e); }
});

// Refresh internal token: requires a valid token, returns a new short-lived token
r.post('/refresh', authMiddleware, async (req, res, next) => {
  try {
    const payload = {
      id: req.user!.id,
      email: (req.user as any)?.email,
      role: req.user!.role,
    } as any;
    const token = signInternalJwt(payload, '30m' as any);
    res.json({ token });
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
