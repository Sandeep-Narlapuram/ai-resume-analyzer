import Redis from 'ioredis';
import { env } from './env.js';
import { logger } from './logger.js';

let sharedConnection = null;

/**
 * Returns a shared ioredis connection. BullMQ requires maxRetriesPerRequest: null
 * on connections it manages, so queue/worker code should pass createConnection()
 * for a dedicated instance rather than reusing this shared one.
 */
export function getRedisConnection() {
  if (!sharedConnection) {
    sharedConnection = new Redis(env.redisUrl, { maxRetriesPerRequest: 3 });
    sharedConnection.on('error', (err) => logger.error({ err }, 'Redis connection error'));
    sharedConnection.on('connect', () => logger.info('Redis connected'));
  }
  return sharedConnection;
}

export function createBullConnection() {
  return new Redis(env.redisUrl, { maxRetriesPerRequest: null });
}
