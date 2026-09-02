import { signupSchema } from './auth.schema.js';
import * as authService from './auth.service.js';

import type { Request, Response, NextFunction } from 'express';

export async function signup(req: Request, res: Response, next: NextFunction) {
  try {
    // Validate request body synchronously. Throws ZodError on failure,
    // which is caught by the global error handler middleware.
    const validatedData = signupSchema.parse(req.body);
    const result = await authService.signup(validatedData);

    return res.status(201).json(result);
  } catch (error) {
    // Propagate all errors (Zod validation, DB constraints, etc.) to the central error handler
    return next(error);
  }
}
