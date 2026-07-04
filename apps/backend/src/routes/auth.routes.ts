import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validation.middleware';
import { loginRateLimiter, authRateLimiter } from '../middleware/rate-limiter.middleware';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
} from '../validators/auth.validator';

const router: Router = Router();

// Public routes (rate-limited)
router.post('/register', authRateLimiter, validateBody(registerSchema), authController.register);
router.post('/login', loginRateLimiter, validateBody(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.post(
  '/forgot-password',
  authRateLimiter,
  validateBody(forgotPasswordSchema),
  authController.forgotPassword,
);
router.post(
  '/reset-password',
  authRateLimiter,
  validateBody(resetPasswordSchema),
  authController.resetPassword,
);

// Protected routes
router.get('/me', requireAuth, authController.getMe);
router.put(
  '/profile',
  requireAuth,
  validateBody(updateProfileSchema),
  authController.updateProfile,
);

export default router;
