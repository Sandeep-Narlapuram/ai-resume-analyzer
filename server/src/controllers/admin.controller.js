import { analysisRepository } from '../repositories/analysis.repository.js';
import { userRepository } from '../repositories/user.repository.js';
import { AppError } from '../utils/AppError.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const adminController = {
  async metrics(req, res) {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [dailyUsage, totalUsers] = await Promise.all([
      analysisRepository.aggregateDailyUsage(since),
      userRepository.countAll(),
    ]);
    sendSuccess(res, { data: { dailyUsage, totalUsers } });
  },

  async setUserStatus(req, res) {
    const { isActive } = req.body;
    const user = await userRepository.setActiveStatus(req.params.id, Boolean(isActive));
    if (!user) throw AppError.notFound('User not found');
    sendSuccess(res, { data: user, message: `User ${isActive ? 'enabled' : 'disabled'}` });
  },
};
