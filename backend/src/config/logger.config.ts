// config/logger.config.ts
// Winston logger setup with sensible defaults for API services
import winston from 'winston';
import morgan from 'morgan';
import { RequestHandler } from 'express';

const isProd = process.env.NODE_ENV === 'production';
const logLevel = process.env.LOG_LEVEL || (isProd ? 'info' : 'debug');

const consoleFormat = winston.format.printf(({ level, message, timestamp, stack, ...meta }) => {
  const base = `${timestamp} [${level}] ${message}`;
  const extra = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  return stack ? `${base}\n${stack}${extra}` : base + extra;
});

export const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.errors({ stack: true }),
    winston.format.timestamp(),
    isProd ? winston.format.json() : winston.format.colorize({ all: true }),
    isProd ? winston.format.json() : consoleFormat
  ),
  transports: [new winston.transports.Console()],
});

/**
 * HTTP request logger middleware using morgan piped into winston
 * - In production, use Apache combined format
 * - In dev, use tiny for brevity
 */
export const httpLogger: RequestHandler = morgan(isProd ? 'combined' : 'tiny', {
  stream: {
    write: (msg: string) => logger.http ? logger.http(msg.trim()) : logger.info(msg.trim()),
  },
});

/** Helper to attach an unhandled rejection handler in app bootstrap */
export function attachGlobalErrorHandlers() {
  process.on('unhandledRejection', (reason: any) => {
    logger.error('UnhandledRejection', { reason });
  });
  process.on('uncaughtException', (err) => {
    logger.error('UncaughtException', { error: err });
    if (isProd) process.exit(1);
  });
}
