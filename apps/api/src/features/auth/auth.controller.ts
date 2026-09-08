import { AppError } from '../../shared/errors/AppError.js';
import { redis } from '../../shared/redis/redis.client.js';

import { resetPasswordSchema, signInSchema, signupSchema } from './auth.schema.js';
import * as authService from './auth.service.js';
import * as googleService from './google.service.js';

import type { AuthenticatedRequest } from '../../shared/middleware/verifyToken.js';
import type { Request, Response, NextFunction } from 'express';

export async function signup(req: Request, res: Response, next: NextFunction) {
  try {
    // Validate request body synchronously. Throws ZodError on failure,
    // which is caught by the global error handler middleware.
    const validatedData = signupSchema.parse(req.body);
    const result = await authService.signup(validatedData);

    if (result.verificationPendingToken) {
      res.cookie('email_verification_pending_token', result.verificationPendingToken, {
        maxAge: 15 * 60 * 1000,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        path: '/',
      });
    }

    return res.status(201).json({ user: result.user });
  } catch (error) {
    // Propagate all errors (Zod validation, DB constraints, etc.) to the central error handler
    return next(error);
  }
}

export async function signin(req: Request, res: Response, next: NextFunction) {
  try {
    // Validate request body synchronously. Throws ZodError on failure,
    // which is caught by the global error handler middleware.
    const validatedData = signInSchema.parse(req.body);
    const { token, user } = await authService.signin(validatedData);

    return res
      .status(200)
      .cookie('auth_token', token, {
        maxAge: 2 * 60 * 60 * 1000,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        path: '/',
      })
      .json({ user });
  } catch (error) {
    // Propagate all errors (Zod validation, DB constraints, etc.) to the central error handler
    return next(error);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const validatedData = resetPasswordSchema.parse(req.body);
    const token = req.cookies.reset_password_token || validatedData.resetToken;

    if (!token) {
      throw new AppError(
        400,
        'INVALID_RESET_TOKEN',
        'Password reset session is invalid or expired.',
      );
    }

    const result = await authService.resetPassword({
      ...validatedData,
      resetToken: token,
    });

    res.clearCookie('reset_password_token', {
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
    });

    return res.status(200).json({ message: result.message });
  } catch (error) {
    return next(error);
  }
}

export async function me(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.sub;
    if (!userId) {
      throw new AppError(401, 'UNAUTHORIZED', 'Invalid session payload');
    }
    const result = await authService.getMe(userId);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function signout(_req: Request, res: Response, next: NextFunction) {
  try {
    res.clearCookie('auth_token', {
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
    });
    return res.status(200).json({ message: 'Signed out successfully' });
  } catch (error) {
    return next(error);
  }
}

export async function googleAuthInit(req: Request, res: Response, next: NextFunction) {
  try {
    const redirectParam = typeof req.query.redirect === 'string' ? req.query.redirect : '/';
    const fromParam = typeof req.query.from === 'string' ? req.query.from : '/signin';
    const authUrl = await googleService.getGoogleAuthUrl(redirectParam, fromParam);
    return res.redirect(authUrl);
  } catch (error) {
    return next(error);
  }
}

export async function googleAuthCallback(req: Request, res: Response, _next: NextFunction) {
  const webOrigin = process.env.WEB_ORIGIN || 'http://localhost:3000';
  let fromUrl = '/signin';

  try {
    const { code, state, error: oauthError } = req.query;

    if (typeof state === 'string') {
      const rawState = await redis.get(`oauth_state:${state}`);
      if (rawState) {
        try {
          const parsed = JSON.parse(rawState) as { fromUrl?: string };
          if (typeof parsed.fromUrl === 'string' && parsed.fromUrl.startsWith('/')) {
            fromUrl = parsed.fromUrl;
          }
        } catch {
          // Ignore JSON parse error
        }
      }
    }

    if (oauthError) {
      return res.redirect(
        `${webOrigin}${fromUrl}?error=${encodeURIComponent(oauthError as string)}`,
      );
    }

    if (typeof code !== 'string' || typeof state !== 'string') {
      return res.redirect(`${webOrigin}${fromUrl}?error=invalid_request`);
    }

    const result = await googleService.handleGoogleCallback(code, state);

    res.cookie('auth_token', result.token, {
      maxAge: 2 * 60 * 60 * 1000,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      path: '/',
    });

    const targetUrl = result.redirectUrl.startsWith('/') ? result.redirectUrl : '/';
    return res.redirect(`${webOrigin}${targetUrl}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Google authentication failed';
    return res.redirect(`${webOrigin}${fromUrl}?error=${encodeURIComponent(errorMessage)}`);
  }
}
