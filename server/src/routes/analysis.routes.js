import { Router } from 'express';
import { analysisController } from '../controllers/analysis.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { enforceAnalysisQuota } from '../middlewares/rateLimiter.middleware.js';
import { requireOwnedResume } from '../middlewares/resumeOwnership.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createAnalysisSchema,
  listAnalysesQuerySchema,
  analysisIdParamSchema,
  compareParamsSchema,
} from '../validators/analysis.validator.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(requireAuth);

router.post(
  '/',
  validate(createAnalysisSchema),
  requireOwnedResume,
  enforceAnalysisQuota,
  asyncHandler(analysisController.create)
);
router.get('/', validate(listAnalysesQuerySchema, 'query'), asyncHandler(analysisController.list));
router.get('/:id', validate(analysisIdParamSchema, 'params'), asyncHandler(analysisController.getById));
router.delete('/:id', validate(analysisIdParamSchema, 'params'), asyncHandler(analysisController.remove));
router.get(
  '/:id/compare/:otherId',
  validate(compareParamsSchema, 'params'),
  asyncHandler(analysisController.compare)
);
router.get(
  '/:id/report-data',
  validate(analysisIdParamSchema, 'params'),
  asyncHandler(analysisController.reportData)
);

export default router;
