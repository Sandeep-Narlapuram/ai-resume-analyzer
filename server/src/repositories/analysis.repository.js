import { Analysis } from '../models/Analysis.js';

export const analysisRepository = {
  create: (data) => Analysis.create(data),

  findById: (id) => Analysis.findById(id),

  findByIdAndUser: (id, userId) => Analysis.findOne({ _id: id, userId }),

  findByIdWithRaw: (id) => Analysis.findById(id).select('+rawAiResponse'),

  updateById: (id, updates) => Analysis.findByIdAndUpdate(id, updates, { new: true, runValidators: true }),

  listByUser: async (userId, { page = 1, limit = 10, sort = '-createdAt' } = {}) => {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Analysis.find({ userId }).sort(sort).skip(skip).limit(limit),
      Analysis.countDocuments({ userId }),
    ]);
    return { items, total, page, totalPages: Math.ceil(total / limit) || 1 };
  },

  deleteByIdAndUser: (id, userId) => Analysis.findOneAndDelete({ _id: id, userId }),

  deleteAllByUser: (userId) => Analysis.deleteMany({ userId }),

  scoreHistoryByUser: (userId) =>
    Analysis.find({ userId, status: 'completed' })
      .sort({ createdAt: 1 })
      .select('atsScore createdAt'),

  // Used by the admin metrics endpoint.
  aggregateDailyUsage: (since) =>
    Analysis.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          avgScore: { $avg: '$atsScore' },
          tokensUsed: { $sum: '$geminiTokensUsed' },
        },
      },
      { $sort: { _id: 1 } },
    ]),
};
