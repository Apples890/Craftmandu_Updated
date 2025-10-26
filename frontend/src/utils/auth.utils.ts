// frontend/utils/auth.utils.ts
import { supabase } from './supabase.client';

/** Get current Supabase session's access token */
export async function getSupabaseAccessToken(): Promise<string | undefined> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token;
}

/** Listen for auth state changes; returns unsubscribe */
export function onAuthChange(cb: (accessToken?: string) => void) {
  const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
    cb(session?.access_token);
  });
  return () => listener.subscription.unsubscribe();
}

/** Helper to ensure logged in (throws if missing) */
export async function requireAuthToken(): Promise<string> {
  const token = await getSupabaseAccessToken();
  if (!token) throw new Error('Not authenticated');
  return token;
}
