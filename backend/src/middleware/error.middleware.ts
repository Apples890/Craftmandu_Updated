// middleware/error.middleware.ts
import { Request, Response, NextFunction } from 'express';

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ error: 'NotFound', path: req.originalUrl });
}

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const status =
    typeof err?.status === 'number'
      ? err.status
      : typeof err?.statusCode === 'number'
      ? err.statusCode
      : 500;

  const payload: Record<string, unknown> = {
    error: err?.name || 'ServerError',
    message:
      err?.message && process.env.NODE_ENV !== 'production'
        ? err.message
        : 'Something went wrong',
    path: req.originalUrl,
    requestId: res.getHeader('x-request-id') || undefined,
  };

  if (process.env.NODE_ENV !== 'production' && err?.stack) {
    payload.stack = err.stack;
  }

  res.status(status).json(payload);
}
