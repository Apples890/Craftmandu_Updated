// services/AuthService.ts
import { Provider } from '@supabase/supabase-js';
import { supabase } from '../db/supabase/client';
import { FullUser, RegistrationData } from '../models/Users';

export type AuthSession = {
  session: Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session'];
  user: FullUser | null;
};

class AuthService {

  
  // Private utility to fetch profile from 'profiles' table
private async fetchUserProfile(): Promise<FullUser | null> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error('Fetch user error:', authError);
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    console.error('Fetch profile error:', profileError);
    return null;
  }

  return {
    ...profile,
    email: user.email,
  };
}


  async getSession(): Promise<AuthSession> {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;

    if (!session?.user?.id) {
      return { session, user: null };
    }

    const user = await this.fetchUserProfile();
    return { session, user };
  }

  async getCurrentUser(): Promise<FullUser | null> {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session?.user?.id) return null;

    return await this.fetchUserProfile();
  }

  async loginWithProvider(provider: Provider) {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) throw error;
    return data;
  }

  async loginWithEmail(email: string, password: string): Promise<AuthSession> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.session?.user?.id) throw error;

    const user = await this.fetchUserProfile();
    return { session: data.session, user };
  }

  async loginWithMagicLink(email: string): Promise<AuthSession> {
    const { data, error } = await supabase.auth.signInWithOtp({ email });
    if (error) throw error;

    return { session: data.session, user: null };
  }

async recoverSession(): Promise<AuthSession> {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) throw new Error('Could not recover session');

  const userId = session?.user?.id;

  if (!userId) {
    return { session: null, user: null };
  }

  // Adjust according to where your actual user profiles live
  const { data: userProfile, error: profileError } = await supabase
    .from('profiles') // or 'users' depending on your schema
    .select('*')
    .eq('id', userId)
    .single();

  if (profileError) {
    console.error('FullUser fetch failed', profileError);
    return { session, user: null };
  }

  return { session, user: userProfile as FullUser };
}


  async clearError() {
    // Placeholder for client-side error handling reset
  }

  async register(data: RegistrationData): Promise<FullUser> {
    const { data: user, error } = await supabase
      .from('users')
      .insert(data)
      .select('*')
      .single();

    if (error) throw error;
    return user as FullUser;
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  }

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async getUserProfile(userId: string): Promise<FullUser | null> {
    return await this.fetchUserProfile();
  }

  async updateUserProfile(userId: string, updates: Partial<FullUser>): Promise<FullUser | null> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select('*')
      .single();

    if (error) {
      console.error('Update user profile error:', error);
      return null;
    }
    return data as FullUser;
  }

  async updateProfile(updates: Partial<FullUser>): Promise<FullUser | null> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('No user logged in');

    return await this.updateUserProfile(user.id, updates);
  }
}

export const authService = new AuthService();
