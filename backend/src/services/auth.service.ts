// services/auth.service.ts
import { supabaseClient } from '@/config/database.config';
import { hashPassword, comparePassword } from '@/utils/hash.utils';
import { signInternalJwt } from '@/utils/jwt.utils';
import { BadRequestError, UnauthorizedError, NotFoundError } from '@/utils/error.utils';
import type { UserDbRow } from '@/types/user.types';
import { slugifyText } from '@/utils/slugify.utils';

/**
 * Authentication & user account business logic.
 * Note: Supabase Auth is usually handled client-side. These helpers are for a custom password flow
 * using your own `users` table (as designed in your schema).
 */
async function generateVendorSlug(db: ReturnType<typeof supabaseClient>, name: string) {
  const base = slugifyText(name, 'vendor');
  let candidate = base;
  let counter = 1;
  while (true) {
    const { data, error } = await db.from('vendors').select('id').eq('slug', candidate).maybeSingle();
    if (error && error.code !== 'PGRST116') throw new BadRequestError(error.message);
    if (!data) return candidate;
    candidate = `${base}-${counter++}`;
  }
}

export const AuthService = {
  /** Register a basic CUSTOMER user in the users table */
  async register(email: string, password: string, fullName: string, role: 'customer' | 'vendor' = 'customer') {
    const db = supabaseClient('service');
    // check existing
    const { data: existing } = await db.from('users').select('id').eq('email', email).maybeSingle();
    if (existing) throw new BadRequestError('Email already in use');

    const password_hash = await hashPassword(password);
    const { data, error } = await db.from('users').insert({
      email, password_hash, full_name: fullName, role: 'CUSTOMER',
    }).select('*').single();
    if (error) throw new BadRequestError(error.message);

    if (role === 'vendor') {
      const shopName = fullName || email.split('@')[0] || 'Vendor';
      const slug = await generateVendorSlug(db, shopName);
      const { error: vendorError } = await db.from('vendors').insert({
        user_id: data.id,
        shop_name: shopName,
        slug,
        status: 'PENDING',
      });
      if (vendorError) throw new BadRequestError(vendorError.message);
    }

    const token = signInternalJwt({ id: data.id, email: data.email, role: data.role });
    return { user: data, token };
  },

  /** Simple login against users table */
  async login(email: string, password: string) {
    const db = supabaseClient('service');
    const { data, error } = await db.from('users').select('*').eq('email', email).single();
    if (error || !data) throw new UnauthorizedError('Invalid credentials');
    const ok = await comparePassword(password, data.password_hash);
    if (!ok) throw new UnauthorizedError('Invalid credentials');
    const token = signInternalJwt({ id: data.id, email: data.email, role: data.role });
    return { user: data, token };
  },

  /** Get profile using the caller's JWT so RLS applies */
  async getProfile(userId: string, jwt: string) {
    const db = supabaseClient('anon', jwt);
    const { data, error } = await db.from('users').select('*').eq('id', userId).single();
    if (error) throw new NotFoundError('User not found');
    return data;
  },

  /** Update limited profile fields */
  async updateProfile(userId: string, jwt: string, patch: Partial<Pick<UserDbRow,'full_name'|'phone'|'avatar_url'>>) {
    const db = supabaseClient('anon', jwt);
    const { data, error } = await db.from('users').update(patch).eq('id', userId).select('*').single();
    if (error) throw new BadRequestError(error.message);
    return data;
  },
};
