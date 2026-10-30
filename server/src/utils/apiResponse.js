export function sendSuccess(res, { data = null, message = undefined, meta = undefined, status = 200 } = {}) {
  return res.status(status).json({
    success: true,
    data,
    ...(message ? { message } : {}),
    ...(meta ? { meta } : {}),
  });
}

export function sendError(res, { code = 'INTERNAL_ERROR', message = 'Something went wrong', status = 500 } = {}) {
  return res.status(status).json({
    success: false,
    error: { code, message },
  });
}
