import { Router } from 'express';
import { contactController } from '../controllers/contact.controller.js';
import { authRateLimiter } from '../middlewares/rateLimiter.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { contactMessageSchema } from '../validators/contact.validator.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

// Reuses the auth rate limiter's bucket (20/15min) — contact forms are a
// classic spam target and this is a public, unauthenticated endpoint.
router.post('/', authRateLimiter, validate(contactMessageSchema), asyncHandler(contactController.submit));

export default router;
