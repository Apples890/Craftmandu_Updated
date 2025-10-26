// middleware/validation.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { ZodSchema, z } from 'zod';

export type RequestSchemas = {
  body?: ZodSchema<any>;
  query?: ZodSchema<any>;
  params?: ZodSchema<any>;
};

export function validate(schemas: RequestSchemas) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schemas.body) req.body = schemas.body.parse(req.body);
      if (schemas.query) req.query = schemas.query.parse(req.query);
      if (schemas.params) req.params = schemas.params.parse(req.params);
      return next();
    } catch (err: any) {
      if (err?.name === 'ZodError') {
        return res.status(422).json({
          error: 'ValidationError',
          details: err.issues.map((i: any) => ({
            path: i.path.join('.'),
            message: i.message,
          })),
        });
      }
      return next(err);
    }
  };
}

// Example reusable schemas
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
