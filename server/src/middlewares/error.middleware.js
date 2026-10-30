import { AppError } from '../utils/AppError.js';
import { sendError } from '../utils/apiResponse.js';
import { logger } from '../config/logger.js';
import { env } from '../config/env.js';

export function notFoundHandler(req, res) {
  sendError(res, { code: 'ROUTE_NOT_FOUND', message: `No route for ${req.method} ${req.originalUrl}`, status: 404 });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    if (!err.isOperational || err.status >= 500) {
      logger.error({ err, path: req.originalUrl }, 'Operational error');
    }
    return sendError(res, { code: err.code, message: err.message, status: err.status });
  }

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    return sendError(res, { code: 'VALIDATION_ERROR', message: err.message, status: 422 });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    return sendError(res, { code: 'DUPLICATE_RESOURCE', message: 'A resource with this value already exists', status: 409 });
  }

  // Multer file errors
  if (err.name === 'MulterError') {
    return sendError(res, { code: 'UPLOAD_ERROR', message: err.message, status: 400 });
  }

  logger.error({ err, path: req.originalUrl }, 'Unhandled error');
  return sendError(res, {
    code: 'INTERNAL_ERROR',
    message: env.isProduction ? 'Something went wrong. Please try again.' : err.message,
    status: 500,
  });
}
