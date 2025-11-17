// middleware/moderation.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { supabaseClient } from '@/config/database.config';

type Action = 'chat' | 'order' | 'review';

function isBanActive(u: any): boolean {
  // Simplified: only check the is_banned flag
  return Boolean(u?.is_banned);
}

export async function fetchUserModeration(userId: string) {
  const db = supabaseClient('service');
  const { data, error } = await db
    .from('users')
    .select('id, is_banned')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}

export function requireNotBanned() {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }
      const u = await fetchUserModeration(userId);
      if (isBanActive(u)) {
        res.status(403).json({ error: 'Account is banned' });
        return;
      }
      next();
    } catch (e: any) {
      next(e);
    }
  };
}

export function requireCan(action: Action) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }
      const u = await fetchUserModeration(userId);
      if (isBanActive(u)) { res.status(403).json({ error: 'Account is banned' }); return; }
      const allowed = action === 'chat' ? u.can_chat
        : action === 'order' ? u.can_order
        : u.can_review;
      if (!allowed) { res.status(403).json({ error: `Action not allowed: ${action}` }); return; }
      next();
    } catch (e: any) {
      next(e);
    }
  };
}
