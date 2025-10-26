// controllers/review.controller.ts
import { Request, Response, NextFunction } from 'express';
import { ReviewService } from '@/services/review.service';
import { reviewCreateSchema } from '@/validators/review.validator';
import { validateInput } from '@/utils/validation.utils';

export const ReviewController = {
  async listForProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const items = await ReviewService.listForProduct(req.params.productId);
      res.json({ reviews: items });
    } catch (err) { next(err); }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const body = validateInput(reviewCreateSchema, req.body);
      const created = await ReviewService.create(req.user!.id, req.user!.jwt, body);
      res.status(201).json(created);
    } catch (err) { next(err); }
  },
};
