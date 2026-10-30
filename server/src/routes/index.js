import { Router } from 'express';
import authRoutes from './auth.routes.js';
import resumeRoutes from './resume.routes.js';
import analysisRoutes from './analysis.routes.js';
import adminRoutes from './admin.routes.js';
import contactRoutes from './contact.routes.js';
import { sendSuccess } from '../utils/apiResponse.js';

const router = Router();

router.get('/health', (req, res) => sendSuccess(res, { data: { status: 'ok', timestamp: new Date().toISOString() } }));

router.use('/auth', authRoutes);
router.use('/resumes', resumeRoutes);
router.use('/analyses', analysisRoutes);
router.use('/admin', adminRoutes);
router.use('/contact', contactRoutes);

export default router;
