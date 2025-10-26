// services/notification.service.ts
import { supabaseClient } from '@/config/database.config';
import { BadRequestError } from '@/utils/error.utils';

export const NotificationService = {
  async listForUser(userId: string, jwt: string) {
    const db = supabaseClient('anon', jwt);
    const { data, error } = await db.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (error) throw new BadRequestError(error.message);
    return data;
  },

  async markRead(id: string, jwt: string, isRead: boolean) {
    const db = supabaseClient('anon', jwt);
    const { data, error } = await db.from('notifications').update({ is_read: isRead }).eq('id', id).select('*').single();
    if (error) throw new BadRequestError(error.message);
    return data;
  },
};
