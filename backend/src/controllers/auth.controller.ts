// controllers/auth.controller.ts
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '@/services/auth.service';
import { loginSchema, registerSchema } from '@/validators/auth.validator';
import { validateInput } from '@/utils/validation.utils';

export const AuthController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const body = validateInput(registerSchema, req.body);
      const result = await AuthService.register(body.email, body.password, body.fullName);
      res.status(201).json(result);
    } catch (err) { next(err); }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const body = validateInput(loginSchema, req.body);
      const result = await AuthService.login(body.email, body.password);
      res.json(result);
    } catch (err) { next(err); }
  },

  async profile(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.getProfile(req.user!.id, req.user!.jwt);
      res.json(result);
    } catch (err) { next(err); }
  },

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      // basic passthrough; rely on route-level zod or service constraints
      const patch = req.body as any;
      const result = await AuthService.updateProfile(req.user!.id, req.user!.jwt, {
        full_name: patch.fullName,
        phone: patch.phone ?? null,
        avatar_url: patch.avatarUrl ?? null,
      });
      res.json(result);
    } catch (err) { next(err); }
  },
};
