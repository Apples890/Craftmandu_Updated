// utils/jwt.utils.ts
import jwt from 'jsonwebtoken';
import { getSigningKey, authConfig } from '@/config/auth.config';
import { AuthUser } from '@/middleware/auth.middleware';

/**
 * Verify a JWT (Supabase or app-specific)
 */
export async function verifyJwt(token: string): Promise<AuthUser | null> {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      getSigningKey,
      {
        audience: authConfig.audience,
        issuer: authConfig.issuer,
        algorithms: authConfig.algorithms,
      },
      (err, payload) => {
        if (err || !payload || typeof payload !== 'object') return reject(err || new Error('Invalid token'));
        const user: AuthUser = {
          id: (payload.sub as string) || '',
          role: (payload['app_role'] as any) || undefined,
          jwt: token,
          ...payload,
        };
        resolve(user);
      }
    );
  });
}

/**
 * Sign a JWT for internal service tokens (not Supabase)
 */
export function signInternalJwt(payload: Record<string, unknown>, expiresIn = '1h'): string {
  const secret = process.env.INTERNAL_JWT_SECRET || 'dev_secret';
  return jwt.sign(payload, secret, { expiresIn });
}
