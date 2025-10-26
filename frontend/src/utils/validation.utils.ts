// frontend/utils/validation.utils.ts
import { z, ZodSchema } from 'zod';

/** Quick safe parse wrapper returning tuple */
export function safeParse<T>(schema: ZodSchema<T>, data: unknown): [T | null, string[]] {
  const r = schema.safeParse(data);
  if (r.success) return [r.data, []];
  const errs = r.error.issues.map(i => `${i.path.join('.')} ${i.message}`);
  return [null, errs];
}

export const emailSchema = z.string().email();
export const uuidSchema = z.string().uuid();
