import { RefreshToken } from '../models/RefreshToken.js';

export const refreshTokenRepository = {
  create: (data) => RefreshToken.create(data),

  findValidByHash: (tokenHash) =>
    RefreshToken.findOne({ tokenHash, revoked: false, expiresAt: { $gt: new Date() } }),

  findByHash: (tokenHash) => RefreshToken.findOne({ tokenHash }),

  revokeByHash: (tokenHash, replacedByTokenHash = null) =>
    RefreshToken.findOneAndUpdate({ tokenHash }, { revoked: true, replacedByTokenHash }),

  revokeAllForUser: (userId) => RefreshToken.updateMany({ userId, revoked: false }, { revoked: true }),
};
