import { Router } from 'express';
import { adminController } from '../controllers/admin.controller.js';
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { userIdParamSchema, setUserStatusSchema } from '../validators/admin.validator.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(requireAuth, requireRole('admin'));

router.get('/metrics', asyncHandler(adminController.metrics));
router.patch(
  '/users/:id/status',
  validate(userIdParamSchema, 'params'),
  validate(setUserStatusSchema),
  asyncHandler(adminController.setUserStatus)
);

export default router;
