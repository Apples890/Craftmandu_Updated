// validators/auth.validator.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(100),
  fullName: z.string().min(1).max(120),
});

export const resetPasswordSchema = z.object({
  email: z.string().email(),
});
