import { Router } from 'express';

import {
  resetPasswordLimiter,
  signInLimiter,
  signUpLimiter,
} from '../../shared/middleware/rateLimiter.js';
import { verifyToken } from '../../shared/middleware/verifyToken.js';

import {
  changePassword,
  googleAuthCallback,
  googleAuthInit,
  initiateAvatarUpload,
  me,
  resetPassword,
  signin,
  signout,
  signup,
  updateMe,
} from './auth.controller.js';

export const authRouter = Router();

authRouter.post('/signup', signUpLimiter, signup);
authRouter.post('/signin', signInLimiter, signin);
authRouter.post('/signout', signout);
authRouter.get('/me', verifyToken, me);
authRouter.patch('/me', verifyToken, updateMe);
authRouter.post('/avatar/upload-url', verifyToken, initiateAvatarUpload);
authRouter.post('/change-password', verifyToken, resetPasswordLimiter, changePassword);
authRouter.post('/reset-password', resetPasswordLimiter, resetPassword);

authRouter.get('/google', googleAuthInit);
authRouter.get('/google/callback', googleAuthCallback);
