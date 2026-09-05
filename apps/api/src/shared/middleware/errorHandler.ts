import { z, ZodError } from 'zod';

import { AppError } from '../errors/AppError.js';

import type { Request, Response, NextFunction } from 'express';

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  // Log the raw error for debugging purposes (consider using a proper logger like Winston/Pino in production)
  console.error(err);

  // Automatically intercept and format Zod schema validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({ error: 'Validation Error', details: z.treeifyError(err) });
  }

  // Handle known application errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ code: err.code, error: err.message });
  }

  // Fallback for unknown errors (could be generic JS Error objects or something else thrown)
  const isError = err instanceof Error;
  const statusObject =
    typeof err === 'object' && err !== null ? (err as Record<string, unknown>) : {};
  const status =
    typeof statusObject.status === 'number'
      ? statusObject.status
      : typeof statusObject.statusCode === 'number'
        ? statusObject.statusCode
        : 500;

  const rawMessage = isError ? err.message : 'Unknown Error';

  // In a real production app, avoid leaking raw error messages for 500 errors to prevent exposing internal architecture
  const message =
    status === 500 && process.env.NODE_ENV === 'production' ? 'Internal Server Error' : rawMessage;

  res.status(status).json({ error: message });
}
