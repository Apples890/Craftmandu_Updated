// config/auth.config.ts
// JWT / Auth configuration for Supabase-backed auth using JWKS
import jwksClient, { JwksClient } from 'jwks-rsa';
import { JwtHeader, SigningKeyCallback } from 'jsonwebtoken';

/**
 * Values used by auth middleware to verify JWT.
 * You can override them via environment variables at runtime.
 */
export const authConfig = {
  jwksUri: process.env.SUPABASE_JWKS_URL || (process.env.SUPABASE_URL ? `${process.env.SUPABASE_URL}/auth/v1/keys` : ''),
  issuer: process.env.JWT_ISSUER || process.env.SUPABASE_URL || '',
  audience: process.env.JWT_AUDIENCE || 'authenticated',
  algorithms: (process.env.JWT_ALGORITHMS || 'RS256').split(',').map(s => s.trim()) as ('RS256' | 'RS384' | 'RS512')[],
};

/** Cached JWKS client for signature verification */
export const jwks: JwksClient = jwksClient({
  jwksUri: authConfig.jwksUri,
  cache: true,
  cacheMaxEntries: 5,
  cacheMaxAge: 10 * 60 * 1000, // 10 minutes
  rateLimit: true,
  jwksRequestsPerMinute: 10,
});

/** Resolver compatible with jsonwebtoken.verify */
export function getSigningKey(header: JwtHeader, cb: SigningKeyCallback) {
  if (!header.kid) return cb(new Error('No KID in token header'));
  jwks.getSigningKey(header.kid, (err, key) => {
    if (err) return cb(err);
    const signingKey = key?.getPublicKey();
    return cb(null, signingKey);
  });
}

/**
 * Express header name containing the bearer token. Centralize here so
 * you can change it if needed (e.g., 'x-auth-token').
 */
export const AUTH_HEADER = 'authorization';

/**
 * Optional custom claim key where you might store an app role inside JWT.
 * Example: payload['app_role'] === 'ADMIN' | 'VENDOR' | 'CUSTOMER'
 */
export const APP_ROLE_CLAIM_KEY = process.env.APP_ROLE_CLAIM_KEY || 'app_role';
