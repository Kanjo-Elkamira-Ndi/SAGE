import type { NextFunction, Request, Response } from 'express';
import type { z } from 'zod';
import { AppError } from '../lib/errors';

export function parseBody<T extends z.ZodTypeAny>(schema: T, body: unknown): z.infer<T> {
  const result = schema.safeParse(body);
  if (!result.success) {
    throw new AppError('VALIDATION_ERROR', 'Invalid request body', 400, result.error.flatten());
  }
  return result.data;
}

export function validate(schema: z.ZodTypeAny) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.body = parseBody(schema, req.body);
      next();
    } catch (err) {
      next(err);
    }
  };
}
