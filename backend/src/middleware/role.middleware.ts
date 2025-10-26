// middleware/role.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { UserRole } from './auth.middleware';

export function requireRole(...allowed: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });
    const userRole = req.user.role;
    if (!userRole) return res.status(403).json({ error: 'Forbidden' });
    if (!allowed.includes(userRole)) return res.status(403).json({ error: 'Forbidden' });
    return next();
  };
}
