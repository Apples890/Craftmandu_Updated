// config/database.config.ts
// Supabase configuration and client helpers for server-side Node/Express (TypeScript)
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Role of the client.
 * - 'anon': uses the public anon key
 * - 'service': uses the service role key (server only — never expose to browser)
 */
export type SupaRole = 'anon' | 'service';

/**
 * Build a Supabase client. If you pass a user's JWT, the client will forward it
 * in the Authorization header so Postgres RLS policies evaluate as that user.
 */
export function supabaseClient(role: SupaRole = 'anon', userJwt?: string): SupabaseClient {
  const url = requiredEnv('SUPABASE_URL');
  const key = role === 'service' ? requiredEnv('SUPABASE_SERVICE_ROLE_KEY') : requiredEnv('SUPABASE_ANON_KEY');

  const client = createClient(url, key, {
    global: {
      headers: userJwt ? { Authorization: `Bearer ${userJwt}` } : {},
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });

  return client;
}

/** Helper to read required envs with a nice error in development */
export function requiredEnv(name: string): string {
  const val = process.env[name];
  if (!val) {
    const msg = `Missing required env: ${name}`;
    if (process.env.NODE_ENV !== 'production') {
      console.error(msg);
    }
    throw new Error(msg);
  }
  return val;
}

/** Convenience getter for common envs */
export const dbConfig = {
  url: process.env.SUPABASE_URL || '',
  anonKey: process.env.SUPABASE_ANON_KEY || '',
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
};
