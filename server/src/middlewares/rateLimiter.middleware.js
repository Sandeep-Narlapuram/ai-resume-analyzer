import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { getRedisConnection } from '../config/redis.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { userRepository } from '../repositories/user.repository.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const redis = getRedisConnection();

/** Global per-IP limiter — a broad net against abuse/scraping. */
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (...args) => redis.call(...args),
    prefix: 'rl:global:',
  }),
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests. Please slow down.' } },
});

/** Tighter limiter for auth endpoints to slow down credential stuffing / brute force. */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (...args) => redis.call(...args),
    prefix: 'rl:auth:',
  }),
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many attempts. Try again later.' } },
});

/**
 * Enforces a per-user daily quota on AI analyses to control Gemini API cost
 * and abuse. Resets dailyAnalysisCount if the stored reset date has passed.
 * Uses an atomic conditional increment (see userRepository) so concurrent
 * requests can't both slip through right at the quota boundary.
 */
export const enforceAnalysisQuota = asyncHandler(async (req, res, next) => {
  const updated = await userRepository.incrementDailyAnalysisCount(req.user.id, env.quotas.dailyAnalysisLimit);

  if (!updated) {
    throw AppError.tooManyRequests(
      `You've reached today's limit of ${env.quotas.dailyAnalysisLimit} analyses. Try again tomorrow.`,
      'ANALYSIS_QUOTA_EXCEEDED'
    );
  }

  next();
});
