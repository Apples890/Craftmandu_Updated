// middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getSigningKey, authConfig } from '@/config/auth.config';

export type UserRole = 'ADMIN' | 'VENDOR' | 'CUSTOMER';
export interface AuthUser {
  id: string;       // sub
  role?: UserRole;  // optional app role claim if you set one
  jwt: string;
  [k: string]: unknown;
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthUser;
  }
}

const JWT_AUDIENCE = authConfig.audience;
const JWT_ISSUER = authConfig.issuer;

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const auth = req.header('authorization');
  if (!auth || !auth.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header' });
    return;
  }
  const token = auth.slice(7);

  // Try verifying as a Supabase JWT (RS256 via JWKS)
  jwt.verify(
    token,
    getSigningKey as any,
    {
      audience: JWT_AUDIENCE,
      issuer: JWT_ISSUER,
      algorithms: authConfig.algorithms,
    },
    (err, payload) => {
      if (!err && payload && typeof payload === 'object') {
        const sub = (payload.sub as string) || '';
        if (!sub) {
          res.status(401).json({ error: 'Missing subject in token' });
          return;
        }
        const role = (payload['app_role'] as UserRole) || undefined;
        req.user = { id: sub, role, jwt: token, ...payload };
        next();
        return;
      }

      // Fallback: verify as internal token (HS256 using INTERNAL_JWT_SECRET)
      try {
        const secret = process.env.INTERNAL_JWT_SECRET || 'dev_secret';
        const payload2 = jwt.verify(token, secret) as any;
        if (!payload2 || typeof payload2 !== 'object') throw new Error('Invalid token');
        const userId = (payload2.sub as string) || (payload2.id as string) || '';
        if (!userId) throw new Error('Missing user id');
        const role = (payload2.role as UserRole) || (payload2['app_role'] as UserRole) || undefined;
        req.user = { id: userId, role, jwt: token, ...payload2 };
        next();
      } catch {
        res.status(401).json({ error: 'Invalid or expired token' });
      }
    }
  );
}
