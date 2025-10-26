// routes/admin.routes.ts
import { Router } from 'express';
import { authMiddleware } from '@/middleware/auth.middleware';
import { requireRole } from '@/middleware/role.middleware';
import { supabaseClient } from '@/config/database.config';

const r = Router();
r.use(authMiddleware, requireRole('ADMIN'));

r.get('/stats', async (_req, res, next) => {
  try {
    const db = supabaseClient('service');
    const tables = ['users','vendors','products','orders','reviews','messages','notifications'];
    const counts: Record<string, number> = {};
    for (const t of tables) {
      const { count, error } = await db.from(t).select('*', { count: 'exact', head: true });
      if (error) throw error;
      counts[t] = count || 0;
    }
    res.json({ counts });
  } catch (e) { next(e); }
});

export default r;
