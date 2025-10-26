// controllers/order.controller.ts
import { Request, Response, NextFunction } from 'express';
import { OrderService } from '@/services/order.service';
import { orderStatusUpdateSchema } from '@/validators/order.validator';
import { validateInput } from '@/utils/validation.utils';

export const OrderController = {
  async listMine(req: Request, res: Response, next: NextFunction) {
    try {
      const orders = await OrderService.listForCustomer(req.user!.id, req.user!.jwt);
      res.json({ orders });
    } catch (err) { next(err); }
  },

  async listVendor(req: Request, res: Response, next: NextFunction) {
    try {
      const orders = await OrderService.listForVendor(req.user!.id, req.user!.jwt);
      res.json({ orders });
    } catch (err) { next(err); }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const body = validateInput(orderStatusUpdateSchema, req.body);
      const updated = await OrderService.updateStatus(req.params.id, req.user!.jwt, body.status);
      res.json(updated);
    } catch (err) { next(err); }
  },
};
