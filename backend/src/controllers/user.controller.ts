// controllers/user.controller.ts
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '@/services/auth.service';

export const UserController = {
  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await AuthService.getProfile(req.user!.id, req.user!.jwt);
      res.json(user);
    } catch (err) { next(err); }
  },

  async updateMe(req: Request, res: Response, next: NextFunction) {
    try {
      const patch = req.body as any;
      const updated = await AuthService.updateProfile(req.user!.id, req.user!.jwt, {
        full_name: patch.fullName,
        phone: patch.phone ?? null,
        avatar_url: patch.avatarUrl ?? null,
      });
      res.json(updated);
    } catch (err) { next(err); }
  },
};
