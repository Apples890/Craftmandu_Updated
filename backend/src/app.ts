import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { authMiddleware } from './middleware/auth.middleware';
import { requireRole } from './middleware/role.middleware';
import { validate, paginationSchema } from './middleware/validation.middleware';
import { apiRateLimiter } from './middleware/rateLimit.middleware';
import { uploadSingleImage } from './middleware/upload.middleware';
import { notFoundHandler, errorHandler } from './middleware/error.middleware';

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(apiRateLimiter);

// Public route
app.get('/health', (_req, res) => res.json({ ok: true }));

// Authenticated route
app.get('/me', authMiddleware, (req, res) => res.json({ user: req.user }));

// RBAC protected route
app.get('/admin/metrics', authMiddleware, requireRole('ADMIN'), (_req, res) => {
  res.json({ metrics: { users: 0 } });
});

// Validated route
app.get('/products', validate({ query: paginationSchema }), (req, res) => {
  res.json({ items: [], page: req.query['page'], limit: req.query['limit'] });
});

// Upload route
app.post('/upload', authMiddleware, uploadSingleImage, async (req, res) => {
  // req.file.buffer contains the bytes, send to S3 or Supabase Storage
  res.json({ size: req.file?.size, mimetype: req.file?.mimetype });
});

// 404 and Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
