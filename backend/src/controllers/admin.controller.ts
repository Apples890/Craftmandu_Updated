// controllers/admin.controller.ts
import { Request, Response, NextFunction } from 'express';
import { supabaseClient } from '@/config/database.config';

export const AdminController = {
  async stats(_req: Request, res: Response, next: NextFunction) {
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
    } catch (err) { next(err); }
  },
};
