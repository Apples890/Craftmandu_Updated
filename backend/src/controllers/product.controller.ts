// controllers/product.controller.ts
import { Request, Response, NextFunction } from 'express';
import { ProductService } from '@/services/product.service';
import { productCreateSchema, productUpdateSchema } from '@/validators/product.validator';
import { validateInput } from '@/utils/validation.utils';

export const ProductController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = Number(req.query.limit ?? 20);
      const items = await ProductService.list(limit);
      res.json({ items });
    } catch (err) { next(err); }
  },

  async getBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await ProductService.getBySlug(req.params.slug);
      res.json(item);
    } catch (err) { next(err); }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const body = validateInput(productCreateSchema, req.body);
      const created = await ProductService.createForVendor(req.user!.id, req.user!.jwt, {
        name: body.name,
        slug: body.slug,
        description: body.description ?? null,
        priceCents: body.priceCents,
        currency: body.currency,
        status: 'ACTIVE',
        categoryId: body.categoryId ?? null,
        sku: body.sku ?? null,
      });
      res.status(201).json(created);
    } catch (err) { next(err); }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const body = validateInput(productUpdateSchema, req.body);
      const patch: any = {};
      if (body.name !== undefined) patch.name = body.name;
      if (body.slug !== undefined) patch.slug = body.slug;
      if (body.description !== undefined) patch.description = body.description;
      if (body.priceCents !== undefined) patch.price_cents = body.priceCents;
      if (body.currency !== undefined) patch.currency = body.currency;
      if (body.categoryId !== undefined) patch.category_id = body.categoryId;
      if (body.sku !== undefined) patch.sku = body.sku;
      const updated = await ProductService.update(req.params.id, req.user!.jwt, patch);
      res.json(updated);
    } catch (err) { next(err); }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ProductService.remove(req.params.id, req.user!.jwt);
      res.json(result);
    } catch (err) { next(err); }
  },
};
