// middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt, { JwtHeader, SigningKeyCallback } from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

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

const JWKS_URL = process.env.SUPABASE_JWKS_URL || `${process.env.SUPABASE_URL}/auth/v1/keys`;
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || 'authenticated';
const JWT_ISSUER = process.env.JWT_ISSUER || process.env.SUPABASE_URL;

const client = jwksClient({
  jwksUri: JWKS_URL!,
  cache: true,
  cacheMaxEntries: 5,
  cacheMaxAge: 10 * 60 * 1000,
  rateLimit: true,
  jwksRequestsPerMinute: 10,
});

function getKey(header: JwtHeader, cb: SigningKeyCallback) {
  if (!header.kid) return cb(new Error('No KID found in token header'));
  client.getSigningKey(header.kid, (err, key) => {
    if (err) return cb(err);
    const signingKey = key?.getPublicKey();
    cb(null, signingKey);
  });
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const auth = req.header('authorization');
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }
  const token = auth.slice(7);

  jwt.verify(
    token,
    getKey,
    {
      audience: JWT_AUDIENCE,
      issuer: JWT_ISSUER,
      algorithms: ['RS256'],
    },
    (err, payload) => {
      if (err || !payload || typeof payload !== 'object') {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }
      const sub = (payload.sub as string) || '';
      if (!sub) return res.status(401).json({ error: 'Missing subject in token' });

      // Optional custom role claim if you add it to JWT
      const role = (payload['app_role'] as UserRole) || undefined;

      req.user = { id: sub, role, jwt: token, ...payload };
      return next();
    }
  );
}
