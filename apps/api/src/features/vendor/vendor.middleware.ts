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
 * 1. Authenticated user exists and is not suspended
 * 2. User has 'vendor' role
 * 3. User owns a vendor profile (any status)
 */
export async function requireVendorProfile(req: VendorRequest, _res: Response, next: NextFunction) {
  try {
    const userId = req.user?.sub;
    if (!userId || typeof userId !== 'string') {
      return next(new AppError(401, 'UNAUTHORIZED', 'Invalid or missing authentication session.'));
    }

    const db = getDb();

    // 1. Verify user exists, is active, and has 'vendor' role
    const user = await db.query.users.findFirst({
      where: eq(users.userId, userId),
    });

    if (!user) {
      return next(new AppError(401, 'UNAUTHORIZED', 'User not found.'));
    }

    if (user.status === 'suspended') {
      return next(new AppError(403, 'ACCOUNT_SUSPENDED', 'Your account has been suspended.'));
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

/**
 * Middleware enforcing that the vendor profile status is specifically 'active'.
 */
export async function requireActiveVendor(req: VendorRequest, res: Response, next: NextFunction) {
  if (!req.vendor) {
    return requireVendorProfile(req, res, (err) => {
      if (err) return next(err);
      if (req.vendor?.status !== 'active') {
        return next(
          new AppError(
            403,
            'VENDOR_NOT_ACTIVE',
            `Vendor account is not active. Current status: ${req.vendor?.status}.`,
          ),
        );
      }
      next();
    });
  }

  if (req.vendor.status !== 'active') {
    return next(
      new AppError(
        403,
        'VENDOR_NOT_ACTIVE',
        `Vendor account is not active. Current status: ${req.vendor.status}.`,
      ),
    );
  }

  next();
}
