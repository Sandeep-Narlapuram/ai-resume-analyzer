import { Router } from 'express';
import { resumeController } from '../controllers/resume.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { uploadResume } from '../middlewares/upload.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { resumeIdParamSchema } from '../validators/resume.validator.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(requireAuth);

router.post('/upload', uploadResume, asyncHandler(resumeController.upload));
router.get('/', asyncHandler(resumeController.list));
router.get('/:id', validate(resumeIdParamSchema, 'params'), asyncHandler(resumeController.getById));
router.get('/:id/file', validate(resumeIdParamSchema, 'params'), asyncHandler(resumeController.download));
router.delete('/:id', validate(resumeIdParamSchema, 'params'), asyncHandler(resumeController.remove));

export default router;
