// utils/logger.utils.ts
import { logger } from '@/config/logger.config';

/**
 * Shorthand wrappers for winston logger.
 */
export const log = {
  info: (msg: string, meta?: any) => logger.info(msg, meta),
  error: (msg: string, meta?: any) => logger.error(msg, meta),
  warn: (msg: string, meta?: any) => logger.warn(msg, meta),
  debug: (msg: string, meta?: any) => logger.debug(msg, meta),
};
