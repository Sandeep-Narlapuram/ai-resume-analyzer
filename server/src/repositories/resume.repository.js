import { Resume } from '../models/Resume.js';

export const resumeRepository = {
  create: (data) => Resume.create(data),

  findById: (id, { withText = false } = {}) => {
    const query = Resume.findById(id);
    return withText ? query.select('+extractedText +storageKey') : query;
  },

  findByIdAndUser: (id, userId, { withText = false, withStorageKey = false } = {}) => {
    const query = Resume.findOne({ _id: id, userId });
    if (withText) return query.select('+extractedText +storageKey');
    if (withStorageKey) return query.select('+storageKey');
    return query;
  },

  listByUser: (userId) => Resume.find({ userId }).sort({ createdAt: -1 }),

  // Returns storage keys BEFORE deleting so the caller can clean up the
  // actual files (this repository has no knowledge of storage internals).
  deleteAllByUser: async (userId) => {
    const resumes = await Resume.find({ userId }).select('+storageKey');
    await Resume.deleteMany({ userId });
    return resumes.map((r) => r.storageKey);
  },

  deleteByIdAndUser: (id, userId) => Resume.findOneAndDelete({ _id: id, userId }),

  countByUser: (userId) => Resume.countDocuments({ userId }),
};
