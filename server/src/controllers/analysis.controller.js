import { analysisRepository } from '../repositories/analysis.repository.js';
import { enqueueAnalysisJob } from '../queues/analysis.queue.js';
import { AppError } from '../utils/AppError.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const analysisController = {
  async create(req, res) {
    const { jobDescriptionText } = req.body;
    const resume = req.resume; // resolved and ownership-checked by requireOwnedResume

    const analysis = await analysisRepository.create({
      userId: req.user.id,
      resumeId: resume._id,
      resumeFileName: resume.originalFileName,
      jobDescriptionText: jobDescriptionText || null,
      status: 'queued',
    });

    await enqueueAnalysisJob({ analysisId: analysis._id.toString() });

    sendSuccess(res, { data: { analysisId: analysis._id, status: analysis.status }, status: 202 });
  },

  async getById(req, res) {
    const analysis = await analysisRepository.findByIdAndUser(req.params.id, req.user.id);
    if (!analysis) throw AppError.notFound('Analysis not found');
    sendSuccess(res, { data: analysis });
  },

  async list(req, res) {
    const { page, limit, sort } = req.query;
    const result = await analysisRepository.listByUser(req.user.id, { page, limit, sort });
    sendSuccess(res, {
      data: { items: result.items },
      meta: { page: result.page, totalPages: result.totalPages, total: result.total },
    });
  },

  async remove(req, res) {
    const analysis = await analysisRepository.deleteByIdAndUser(req.params.id, req.user.id);
    if (!analysis) throw AppError.notFound('Analysis not found');
    sendSuccess(res, { message: 'Analysis deleted' });
  },

  async compare(req, res) {
    const [a, b] = await Promise.all([
      analysisRepository.findByIdAndUser(req.params.id, req.user.id),
      analysisRepository.findByIdAndUser(req.params.otherId, req.user.id),
    ]);
    if (!a || !b) throw AppError.notFound('One or both analyses were not found');

    const scoreDelta = (b.atsScore ?? 0) - (a.atsScore ?? 0);
    const beforeKeywords = new Set(a.matchedKeywords || []);
    const newlyMatched = (b.matchedKeywords || []).filter((kw) => !beforeKeywords.has(kw));

    sendSuccess(res, {
      data: {
        before: { id: a._id, score: a.atsScore, createdAt: a.createdAt },
        after: { id: b._id, score: b.atsScore, createdAt: b.createdAt },
        scoreDelta,
        newlyMatchedKeywords: newlyMatched,
      },
    });
  },

  async reportData(req, res) {
    const analysis = await analysisRepository.findByIdAndUser(req.params.id, req.user.id);
    if (!analysis) throw AppError.notFound('Analysis not found');
    if (analysis.status !== 'completed') {
      throw AppError.badRequest('This analysis is not ready yet', 'ANALYSIS_NOT_READY');
    }
    sendSuccess(res, { data: analysis });
  },
};
