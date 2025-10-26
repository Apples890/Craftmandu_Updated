// controllers/vendor.controller.ts
import { Request, Response, NextFunction } from 'express';
import { VendorService } from '@/services/vendor.service';
import { vendorCreateSchema, vendorUpdateSchema } from '@/validators/vendor.validator';
import { validateInput } from '@/utils/validation.utils';

export const VendorController = {
  // Public: by slug
  async getBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const v = await VendorService.getBySlug(req.params.slug);
      res.json(v);
    } catch (err) { next(err); }
  },

  // Vendor self
  async getMine(req: Request, res: Response, next: NextFunction) {
    try {
      const v = await VendorService.getMine(req.user!.id, req.user!.jwt);
      res.json(v);
    } catch (err) { next(err); }
  },

  async updateMine(req: Request, res: Response, next: NextFunction) {
    try {
      const body = validateInput(vendorUpdateSchema, req.body);
      const patch: any = {
        shop_name: body.shopName,
        description: body.description ?? null,
        logo_url: body.logoUrl ?? null,
        banner_url: body.bannerUrl ?? null,
        address_line1: (body as any).addressLine1 ?? undefined,
        address_line2: (body as any).addressLine2 ?? undefined,
        city: (body as any).city ?? undefined,
        country: (body as any).country ?? undefined,
      };
      const updated = await VendorService.updateMine(req.user!.id, req.user!.jwt, patch);
      res.json(updated);
    } catch (err) { next(err); }
  },
};
