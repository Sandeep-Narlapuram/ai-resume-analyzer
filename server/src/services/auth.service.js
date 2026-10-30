import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { env } from '../config/env.js';
import { userRepository } from '../repositories/user.repository.js';
import { refreshTokenRepository } from '../repositories/refreshToken.repository.js';
import { AppError } from '../utils/AppError.js';

const BCRYPT_COST_FACTOR = 12;
const REFRESH_TOKEN_BYTES = 48;

function hashToken(rawToken) {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

function refreshExpiryDate() {
  const match = /^(\d+)([dh])$/.exec(env.jwt.refreshExpiresIn);
  const amount = match ? Number(match[1]) : 30;
  const unit = match ? match[2] : 'd';
  const ms = unit === 'h' ? amount * 60 * 60 * 1000 : amount * 24 * 60 * 60 * 1000;
  return new Date(Date.now() + ms);
}

export const authService = {
  async hashPassword(plain) {
    return bcrypt.hash(plain, BCRYPT_COST_FACTOR);
  },

  async verifyPassword(plain, hash) {
    return bcrypt.compare(plain, hash);
  },

  signAccessToken(user) {
    return jwt.sign({ sub: user._id.toString(), role: user.role }, env.jwt.accessSecret, {
      expiresIn: env.jwt.accessExpiresIn,
    });
  },

  /**
   * Issues a new opaque refresh token, stores only its hash (never the raw
   * value) in MongoDB, and returns the raw token to be set as an httpOnly cookie.
   */
  async issueRefreshToken(user) {
    const rawToken = crypto.randomBytes(REFRESH_TOKEN_BYTES).toString('hex');
    const tokenHash = hashToken(rawToken);
    await refreshTokenRepository.create({
      userId: user._id,
      tokenHash,
      expiresAt: refreshExpiryDate(),
    });
    return rawToken;
  },

  /**
   * Rotates a refresh token: validates it, revokes it, and issues a new one.
   * If the presented token was already revoked, every token for that user is
   * revoked too — a reused/stolen token is the standard signal of theft.
   */
  async rotateRefreshToken(rawToken) {
    if (!rawToken) throw AppError.unauthorized('Missing refresh token');
    const tokenHash = hashToken(rawToken);

    const existing = await refreshTokenRepository.findByHash(tokenHash);
    if (!existing) throw AppError.unauthorized('Invalid refresh token');

    if (existing.revoked) {
      await refreshTokenRepository.revokeAllForUser(existing.userId);
      throw AppError.unauthorized('Refresh token reuse detected — all sessions revoked', 'TOKEN_REUSE_DETECTED');
    }

    if (existing.expiresAt < new Date()) {
      throw AppError.unauthorized('Refresh token expired');
    }

    const user = await userRepository.findById(existing.userId);
    if (!user || !user.isActive) throw AppError.unauthorized('Account is no longer active');

    const newRawToken = await authService.issueRefreshToken(user);
    const newTokenHash = hashToken(newRawToken);
    await refreshTokenRepository.revokeByHash(tokenHash, newTokenHash);

    return { user, rawToken: newRawToken, accessToken: authService.signAccessToken(user) };
  },

  async revokeRefreshToken(rawToken) {
    if (!rawToken) return;
    await refreshTokenRepository.revokeByHash(hashToken(rawToken));
  },

  hashToken,

  generatePasswordResetToken() {
    const rawToken = crypto.randomBytes(32).toString('hex');
    return { rawToken, tokenHash: hashToken(rawToken), expiresAt: new Date(Date.now() + 60 * 60 * 1000) };
  },
};
