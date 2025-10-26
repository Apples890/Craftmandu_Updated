// config/cors.config.ts
// Centralized CORS options for Express
import { CorsOptions } from 'cors';

/**
 * Build CORS options from environment variables.
 *  - CORS_ORIGINS: comma-separated list (e.g., http://localhost:3000,https://app.example.com)
 *  - CORS_METHODS: comma-separated list (default: GET,HEAD,PUT,PATCH,POST,DELETE)
 *  - CORS_HEADERS: comma-separated list for allowed headers
 *  - CORS_CREDENTIALS: 'true' to enable credentials
 */
export function buildCorsOptions(): CorsOptions {
  const originEnv = (process.env.CORS_ORIGINS || '').trim();
  const origins = originEnv ? originEnv.split(',').map(s => s.trim()) : ['http://localhost:3000'];

  const methods = (process.env.CORS_METHODS || 'GET,HEAD,PUT,PATCH,POST,DELETE')
    .split(',')
    .map(s => s.trim() as any);

  const allowedHeaders = (process.env.CORS_HEADERS || 'Authorization,Content-Type')
    .split(',')
    .map(s => s.trim());

  const credentials = String(process.env.CORS_CREDENTIALS || 'true').toLowerCase() === 'true';

  const options: CorsOptions = {
    origin: function (origin, callback) {
      // Allow non-browser or same-origin requests where origin is undefined
      if (!origin) return callback(null, true);
      if (origins.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    methods,
    allowedHeaders,
    credentials,
    maxAge: Number(process.env.CORS_MAX_AGE || 600), // seconds
  };

  return options;
}

export const defaultCorsOptions = buildCorsOptions();
