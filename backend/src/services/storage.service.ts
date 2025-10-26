// services/storage.service.ts
import { supabaseClient } from '@/config/database.config';
import { randomUUID } from 'crypto';

export const StorageService = {
  /** Upload a file buffer to Supabase Storage and return public URL */
  async uploadPublic(bucket: string, bytes: Buffer, contentType: string, folder = '') {
    const db = supabaseClient('service');
    const filename = `${folder ? folder + '/' : ''}${randomUUID()}`;
    const { data, error } = await db.storage.from(bucket).upload(filename, bytes, {
      contentType,
      upsert: false,
    });
    if (error) throw error;
    const { data: pub } = db.storage.from(bucket).getPublicUrl(data.path);
    return { path: data.path, publicUrl: pub.publicUrl };
  },
};
