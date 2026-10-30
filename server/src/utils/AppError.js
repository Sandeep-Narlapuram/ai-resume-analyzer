export class AppError extends Error {
  constructor(message, { status = 500, code = 'INTERNAL_ERROR', details = undefined } = {}) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.isOperational = true; // distinguishes expected errors from programming bugs
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, code = 'BAD_REQUEST', details) {
    return new AppError(message, { status: 400, code, details });
  }

  static unauthorized(message = 'Unauthorized', code = 'UNAUTHORIZED') {
    return new AppError(message, { status: 401, code });
  }

  static forbidden(message = 'Forbidden', code = 'FORBIDDEN') {
    return new AppError(message, { status: 403, code });
  }

  static notFound(message = 'Not found', code = 'NOT_FOUND') {
    return new AppError(message, { status: 404, code });
  }

  static conflict(message, code = 'CONFLICT') {
    return new AppError(message, { status: 409, code });
  }

  static tooManyRequests(message = 'Too many requests', code = 'RATE_LIMITED') {
    return new AppError(message, { status: 429, code });
  }

  static unprocessable(message, code = 'UNPROCESSABLE', details) {
    return new AppError(message, { status: 422, code, details });
  }
}
