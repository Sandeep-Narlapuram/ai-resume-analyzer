import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { authRateLimiter } from '../middlewares/rateLimiter.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
  changePasswordSchema,
  deleteAccountSchema,
} from '../validators/auth.validator.js';

const router = Router();

router.post('/register', authRateLimiter, validate(registerSchema), asyncHandler(authController.register));
router.post('/login', authRateLimiter, validate(loginSchema), asyncHandler(authController.login));
router.post('/refresh', asyncHandler(authController.refresh));
router.post('/logout', asyncHandler(authController.logout));
router.post(
  '/forgot-password',
  authRateLimiter,
  validate(forgotPasswordSchema),
  asyncHandler(authController.forgotPassword)
);
router.post('/reset-password', authRateLimiter, validate(resetPasswordSchema), asyncHandler(authController.resetPassword));
router.get('/me', requireAuth, asyncHandler(authController.me));
router.patch('/me', requireAuth, validate(updateProfileSchema), asyncHandler(authController.updateProfile));
router.patch(
  '/password',
  requireAuth,
  authRateLimiter,
  validate(changePasswordSchema),
  asyncHandler(authController.changePassword)
);
router.delete(
  '/me',
  requireAuth,
  authRateLimiter,
  validate(deleteAccountSchema),
  asyncHandler(authController.deleteAccount)
);

export default router;
