import { getDb } from '@repo/db';
import { users, vendors } from '@repo/db/schema';
import { eq } from 'drizzle-orm';

import { AppError } from '../../shared/errors/AppError.js';

import type { AuthenticatedRequest } from '../../shared/middleware/verifyToken.js';
import type { NextFunction, Response } from 'express';

export interface VendorRequest extends AuthenticatedRequest {
  vendor?: {
    vendorId: string;
    userId: string;
    name: string;
    slug: string;
    status: 'pending' | 'active' | 'suspended' | 'rejected';
  };
}

/**
 * Middleware enforcing:
 * 1. Authenticated user exists
 * 2. User has 'vendor' role
 * 3. User owns a vendor profile
 * 4. Vendor profile status is 'active'
 */
export async function requireActiveVendor(req: VendorRequest, _res: Response, next: NextFunction) {
  try {
    const userId = req.user?.sub;
    if (!userId || typeof userId !== 'string') {
      return next(new AppError(401, 'UNAUTHORIZED', 'Invalid or missing authentication session.'));
    }

    const db = getDb();

    // 1. Verify user exists and has 'vendor' role
    const user = await db.query.users.findFirst({
      where: eq(users.userId, userId),
    });

    if (!user) {
      return next(new AppError(401, 'UNAUTHORIZED', 'User not found.'));
    }

    if (!user.roles.includes('vendor')) {
      return next(
        new AppError(403, 'VENDOR_ROLE_REQUIRED', 'Access denied: Vendor role required.'),
      );
    }

    // 2. Resolve vendor profile owned by this user
    const vendor = await db.query.vendors.findFirst({
      where: eq(vendors.userId, user.userId),
    });

    if (!vendor) {
      return next(
        new AppError(
          403,
          'VENDOR_PROFILE_NOT_FOUND',
          'Vendor profile does not exist for this account.',
        ),
      );
    }

    // 3. Verify vendor status is active
    if (vendor.status !== 'active') {
      return next(
        new AppError(
          403,
          'VENDOR_NOT_ACTIVE',
          `Vendor account is not active. Current status: ${vendor.status}.`,
        ),
      );
    }

    req.vendor = {
      vendorId: vendor.vendorId,
      userId: vendor.userId,
      name: vendor.name,
      slug: vendor.slug,
      status: vendor.status,
    };

    next();
  } catch (error) {
    next(error);
  }
}
