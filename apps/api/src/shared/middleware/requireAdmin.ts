import { getDb } from '@repo/db';
import { users } from '@repo/db/schema';
import { eq } from 'drizzle-orm';

import { AppError } from '../errors/AppError.js';

import type { AuthenticatedRequest } from './verifyToken.js';
import type { NextFunction, Response } from 'express';

/**
 * Middleware enforcing that the authenticated user has the 'admin' role.
 */
export async function requireAdmin(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  try {
    const userId = req.user?.sub;
    if (!userId || typeof userId !== 'string') {
      return next(new AppError(401, 'UNAUTHORIZED', 'Invalid or missing authentication session.'));
    }

    const db = getDb();
    const user = await db.query.users.findFirst({
      where: eq(users.userId, userId),
      columns: {
        userId: true,
        roles: true,
      },
    });

    if (!user) {
      return next(new AppError(401, 'UNAUTHORIZED', 'User not found.'));
    }

    if (!user.roles.includes('admin')) {
      return next(new AppError(403, 'FORBIDDEN', 'Access denied: Admin role required.'));
    }

    next();
  } catch (error) {
    next(error);
  }
}
