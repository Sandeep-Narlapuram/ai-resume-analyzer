import { User } from '../models/User.js';

export const userRepository = {
  create: (data) => User.create(data),

  findByEmail: (email, { withPassword = false } = {}) => {
    const query = User.findOne({ email: email.toLowerCase() });
    return withPassword ? query.select('+passwordHash') : query;
  },

  findById: (id, { withPassword = false } = {}) => {
    const query = User.findById(id);
    return withPassword ? query.select('+passwordHash') : query;
  },

  updateById: (id, updates) => User.findByIdAndUpdate(id, updates, { new: true, runValidators: true }),

  setPasswordResetToken: (id, { tokenHash, expiresAt }) =>
    User.findByIdAndUpdate(id, { passwordResetTokenHash: tokenHash, passwordResetExpiresAt: expiresAt }),

  findByValidResetToken: (tokenHash) =>
    User.findOne({
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: { $gt: new Date() },
    }).select('+passwordResetTokenHash +passwordResetExpiresAt'),

  clearPasswordResetToken: (id) =>
    User.findByIdAndUpdate(id, { $unset: { passwordResetTokenHash: 1, passwordResetExpiresAt: 1 } }),

  setActiveStatus: (id, isActive) => User.findByIdAndUpdate(id, { isActive }, { new: true }),

  deleteById: (id) => User.findByIdAndDelete(id),

  /**
   * Atomically resets the daily counter if the stored reset date has
   * passed, then atomically increments it only if still under the limit.
   * Using findOneAndUpdate with the limit in the query condition (rather
   * than a separate read-then-write) means two concurrent requests can't
   * both read "3 of 5 used" and both be allowed through — MongoDB
   * serializes the two atomic updates, so only one can win once the count
   * reaches the limit. Returns the updated user, or null if the user
   * wasn't found or was already at/over the limit.
   */
  async incrementDailyAnalysisCount(userId, dailyLimit) {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    await User.updateOne(
      { _id: userId, dailyAnalysisResetAt: { $lt: startOfToday } },
      { $set: { dailyAnalysisCount: 0, dailyAnalysisResetAt: new Date() } }
    );

    return User.findOneAndUpdate(
      { _id: userId, dailyAnalysisCount: { $lt: dailyLimit } },
      { $inc: { dailyAnalysisCount: 1 } },
      { new: true }
    );
  },

  countAll: () => User.countDocuments(),
};
