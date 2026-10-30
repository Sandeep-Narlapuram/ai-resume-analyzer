import dotenv from 'dotenv';

dotenv.config();

function withFallback(name, fallback) {
  return process.env[name] ?? fallback;
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  port: Number(process.env.PORT || 5000),
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',

  mongoUri: withFallback('MONGODB_URI', 'mongodb://localhost:27017/ai-resume-analyzer'),
  redisUrl: withFallback('REDIS_URL', 'redis://localhost:6379'),

  jwt: {
    accessSecret: withFallback('JWT_ACCESS_SECRET', 'dev_only_access_secret_change_me_32chars'),
    refreshSecret: withFallback('JWT_REFRESH_SECRET', 'dev_only_refresh_secret_change_me_32chars'),
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },

  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    model: process.env.GEMINI_MODEL || 'gemini-1.5-pro',
  },

  storage: {
    provider: process.env.STORAGE_PROVIDER || 'local',
    localDir: process.env.LOCAL_STORAGE_DIR || './storage/resumes',
    maxUploadSizeMb: Number(process.env.MAX_UPLOAD_SIZE_MB || 5),
    s3: {
      region: process.env.AWS_REGION,
      bucket: process.env.AWS_S3_BUCKET,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  },

  quotas: {
    dailyAnalysisLimit: Number(process.env.DAILY_ANALYSIS_LIMIT || 5),
  },

  email: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
    from: process.env.EMAIL_FROM || 'ScoreMyResume <no-reply@scoremyresume.app>',
    contactRecipient: process.env.CONTACT_RECIPIENT_EMAIL || process.env.SMTP_USER,
  },
};

/**
 * Called once at boot (see server.js) so missing critical secrets fail fast
 * in production instead of surfacing as cryptic errors deep in a request.
 */
export function assertProductionEnv() {
  if (!env.isProduction) return;
  const required = ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET', 'MONGODB_URI', 'REDIS_URL', 'GEMINI_API_KEY'];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Missing required environment variables in production: ${missing.join(', ')}`);
  }
}
