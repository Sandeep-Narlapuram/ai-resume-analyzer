import { AppError } from '../utils/AppError.js';

/**
 * Returns Express middleware that validates req[source] against a Zod schema,
 * rejects unknown fields (schemas should use .strict()), and replaces
 * req[source] with the parsed/typed result.
 */
export function validate(schema, source = 'body') {
  return function validationMiddleware(req, res, next) {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      }));
      return next(AppError.unprocessable('Validation failed', 'VALIDATION_ERROR', details));
    }
    req[source] = result.data;
    next();
  };
}
