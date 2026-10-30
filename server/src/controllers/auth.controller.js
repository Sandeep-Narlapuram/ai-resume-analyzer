import { authService } from '../services/auth.service.js';
import { userRepository } from '../repositories/user.repository.js';
import { refreshTokenRepository } from '../repositories/refreshToken.repository.js';
import { resumeRepository } from '../repositories/resume.repository.js';
import { analysisRepository } from '../repositories/analysis.repository.js';
import { storageService } from '../services/storage.service.js';
import { emailService } from '../services/email.service.js';
import { AppError } from '../utils/AppError.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

const REFRESH_COOKIE_NAME = 'refreshToken';

function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: 'strict',
    path: '/api/v1/auth',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  };
}

export const authController = {
  async register(req, res) {
    const { name, email, password } = req.body;

    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw AppError.conflict('An account with this email already exists', 'EMAIL_ALREADY_REGISTERED');
    }

    const passwordHash = await authService.hashPassword(password);
    const user = await userRepository.create({ name, email, passwordHash });

    const accessToken = authService.signAccessToken(user);
    const refreshToken = await authService.issueRefreshToken(user);

    res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions());
    sendSuccess(res, { data: { user, accessToken }, status: 201 });
  },

  async login(req, res) {
    const { email, password } = req.body;

    const user = await userRepository.findByEmail(email, { withPassword: true });
    if (!user || !user.isActive) {
      throw AppError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    const isValid = await authService.verifyPassword(password, user.passwordHash);
    if (!isValid) {
      throw AppError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    const accessToken = authService.signAccessToken(user);
    const refreshToken = await authService.issueRefreshToken(user);

    res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions());
    sendSuccess(res, { data: { user: user.toJSON(), accessToken } });
  },

  async refresh(req, res) {
    const rawToken = req.cookies?.[REFRESH_COOKIE_NAME];

    try {
      const { user, rawToken: newRawToken, accessToken } = await authService.rotateRefreshToken(rawToken);
      res.cookie(REFRESH_COOKIE_NAME, newRawToken, refreshCookieOptions());
      sendSuccess(res, { data: { user, accessToken } });
    } catch (err) {
      res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/v1/auth' });
      throw err;
    }
  },

  async logout(req, res) {
    const rawToken = req.cookies?.[REFRESH_COOKIE_NAME];
    await authService.revokeRefreshToken(rawToken);
    res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/v1/auth' });
    sendSuccess(res, { message: 'Logged out' });
  },

  async forgotPassword(req, res) {
    const { email } = req.body;
    const user = await userRepository.findByEmail(email);

    // Always respond success — never reveal whether an email is registered.
    if (user) {
      const { rawToken, tokenHash, expiresAt } = authService.generatePasswordResetToken();
      await userRepository.setPasswordResetToken(user._id, { tokenHash, expiresAt });

      const resetUrlBase = `${env.clientOrigin}/reset-password`;
      const result = await emailService.sendPasswordResetEmail(user.email, rawToken, resetUrlBase);

      if (!emailService.isConfigured()) {
        // No SMTP configured (common in local dev) — the token is logged so
        // the flow is still testable end-to-end without real email.
        logger.info({ userId: user._id.toString() }, 'Password reset token issued (SMTP not configured, not emailed)');
      } else if (!result.sent) {
        logger.warn({ userId: user._id.toString() }, 'Password reset email failed to send');
      }
    }

    sendSuccess(res, { message: 'If that email is registered, a reset link has been sent.' });
  },

  async resetPassword(req, res) {
    const { token, password } = req.body;
    const tokenHash = authService.hashToken(token);

    const user = await userRepository.findByValidResetToken(tokenHash);
    if (!user) {
      throw AppError.badRequest('This reset link is invalid or has expired', 'INVALID_RESET_TOKEN');
    }

    const passwordHash = await authService.hashPassword(password);
    await userRepository.updateById(user._id, { passwordHash });
    await userRepository.clearPasswordResetToken(user._id);
    await refreshTokenRepository.revokeAllForUser(user._id);

    sendSuccess(res, { message: 'Password updated. You can now log in.' });
  },

  async me(req, res) {
    const user = await userRepository.findById(req.user.id);
    if (!user) throw AppError.notFound('User not found');
    sendSuccess(res, { data: user });
  },

  async updateProfile(req, res) {
    if (req.body.email) {
      const existing = await userRepository.findByEmail(req.body.email);
      if (existing && existing._id.toString() !== req.user.id) {
        throw AppError.conflict('That email is already in use', 'EMAIL_ALREADY_REGISTERED');
      }
    }
    const user = await userRepository.updateById(req.user.id, req.body);
    sendSuccess(res, { data: user });
  },

  async changePassword(req, res) {
    const { currentPassword, newPassword } = req.body;

    const user = await userRepository.findById(req.user.id, { withPassword: true });
    if (!user) throw AppError.notFound('User not found');

    const isValid = await authService.verifyPassword(currentPassword, user.passwordHash);
    if (!isValid) {
      throw AppError.unauthorized('Current password is incorrect', 'INVALID_CURRENT_PASSWORD');
    }

    const passwordHash = await authService.hashPassword(newPassword);
    const updatedUser = await userRepository.updateById(req.user.id, { passwordHash });

    // Changing your password should end every other session, not just this one.
    await refreshTokenRepository.revokeAllForUser(req.user.id);
    const newRefreshToken = await authService.issueRefreshToken(updatedUser);
    const newAccessToken = authService.signAccessToken(updatedUser);

    res.cookie(REFRESH_COOKIE_NAME, newRefreshToken, refreshCookieOptions());
    sendSuccess(res, { data: { accessToken: newAccessToken }, message: 'Password updated' });
  },

  async deleteAccount(req, res) {
    const { password } = req.body;

    const user = await userRepository.findById(req.user.id, { withPassword: true });
    if (!user) throw AppError.notFound('User not found');

    const isValid = await authService.verifyPassword(password, user.passwordHash);
    if (!isValid) {
      throw AppError.unauthorized('Password is incorrect', 'INVALID_PASSWORD');
    }

    // Cascade: remove the user's resumes (files + records) and analyses
    // before removing the account itself, then revoke every session.
    const storageKeys = await resumeRepository.deleteAllByUser(req.user.id);
    await Promise.all(storageKeys.filter(Boolean).map((key) => storageService.delete(key)));
    await analysisRepository.deleteAllByUser(req.user.id);
    await refreshTokenRepository.revokeAllForUser(req.user.id);
    await userRepository.deleteById(req.user.id);

    res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/v1/auth' });
    sendSuccess(res, { message: 'Account deleted' });
  },
};
