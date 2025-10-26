// controllers/notification.controller.ts
import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '@/services/notification.service';
import { z } from 'zod';
import { validateInput } from '@/utils/validation.utils';

const markSchema = z.object({ isRead: z.boolean() });

export const NotificationController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const items = await NotificationService.listForUser(req.user!.id, req.user!.jwt);
      res.json({ items });
    } catch (err) { next(err); }
  },

  async mark(req: Request, res: Response, next: NextFunction) {
    try {
      const body = validateInput(markSchema, req.body);
      const updated = await NotificationService.markRead(req.params.id, req.user!.jwt, body.isRead);
      res.json(updated);
    } catch (err) { next(err); }
  },
};
