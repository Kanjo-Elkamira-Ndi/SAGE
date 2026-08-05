type Level = 'debug' | 'info' | 'warn' | 'error';

function serialize(meta?: unknown): string {
  if (meta === undefined) return '';
  if (typeof meta === 'string') return ` ${meta}`;
  try {
    return ` ${JSON.stringify(meta)}`;
  } catch {
    return ` ${String(meta)}`;
  }
}

function emit(level: Level, message: string, meta?: unknown): void {
  const line = `[${new Date().toISOString()}] ${level.toUpperCase()} ${message}${serialize(meta)}`;
  if (level === 'error') {
    // eslint-disable-next-line no-console
    console.error(line);
  } else if (level === 'warn') {
    // eslint-disable-next-line no-console
    console.warn(line);
  } else {
    // eslint-disable-next-line no-console
    console.log(line);
  }
}

export const logger = {
  debug: (message: string, meta?: unknown) => emit('debug', message, meta),
  info: (message: string, meta?: unknown) => emit('info', message, meta),
  warn: (message: string, meta?: unknown) => emit('warn', message, meta),
  error: (message: string, meta?: unknown) => emit('error', message, meta),
};

import type { NextFunction, Request, Response } from 'express';

export function httpLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  res.on('finish', () => {
    emit('info', `${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - start}ms`);
  });
  next();
}
