// controllers/chat.controller.ts
import { Request, Response, NextFunction } from 'express';
import { ChatService } from '@/services/chat.service';
import { z } from 'zod';
import { validateInput } from '@/utils/validation.utils';

const convSchema = z.object({
  vendorId: z.string().uuid(),
  productId: z.string().uuid().nullable().optional(),
});

const msgSchema = z.object({
  conversationId: z.string().uuid(),
  content: z.string().min(1).max(4000),
});

export const ChatController = {
  async upsertConversation(req: Request, res: Response, next: NextFunction) {
    try {
      const body = validateInput(convSchema, req.body);
      const conv = await ChatService.upsertConversation(req.user!.id, req.user!.jwt, body.vendorId, body.productId ?? null);
      res.status(201).json(conv);
    } catch (err) { next(err); }
  },

  async listConversations(req: Request, res: Response, next: NextFunction) {
    try {
      const items = await ChatService.listConversations(req.user!.id, req.user!.jwt);
      res.json({ items });
    } catch (err) { next(err); }
  },

  async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const body = validateInput(msgSchema, req.body);
      const msg = await ChatService.sendMessage(req.user!.id, req.user!.jwt, body.conversationId, body.content);
      res.status(201).json(msg);
    } catch (err) { next(err); }
  },

  async listMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const items = await ChatService.listMessages(req.user!.jwt, req.params.conversationId);
      res.json({ items });
    } catch (err) { next(err); }
  },
};
