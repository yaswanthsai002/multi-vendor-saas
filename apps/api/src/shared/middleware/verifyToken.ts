import { jwtVerify, type JWTPayload } from 'jose';

import { AppError } from '../errors/AppError.js';

import type { NextFunction, Request, Response } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

const secret = process.env.JWT_SECRET;

if (!secret) {
  throw new Error('JWT_SECRET is not configured');
}

const secretKey = new TextEncoder().encode(secret);

export async function verifyToken(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.auth_token;

    if (!token) {
      return next(new AppError(401, 'AUTH_TOKEN_MISSING', 'Authentication required'));
    }

    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ['HS512'],
      issuer: 'perigee-api',
      audience: 'perigee-web-app',
    });

    req.user = payload;

    next();
  } catch {
    return next(new AppError(401, 'AUTH_TOKEN_INVALID', 'Invalid or expired token'));
  }
}
