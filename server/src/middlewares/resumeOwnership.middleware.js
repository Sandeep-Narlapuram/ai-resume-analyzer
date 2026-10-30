import { resumeRepository } from '../repositories/resume.repository.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Verifies req.body.resumeId belongs to the authenticated user and attaches
 * the resolved resume as req.resume, so downstream handlers (and the quota
 * middleware, which runs after this one) never spend anything on a request
 * for a resume that doesn't exist or belongs to someone else.
 */
export const requireOwnedResume = asyncHandler(async (req, res, next) => {
  const resume = await resumeRepository.findByIdAndUser(req.body.resumeId, req.user.id);
  if (!resume) throw AppError.notFound('Resume not found');
  req.resume = resume;
  next();
});
