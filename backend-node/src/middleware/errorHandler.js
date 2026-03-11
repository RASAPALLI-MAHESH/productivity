'use strict';

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  const isClientError = status < 500;

  if (!isClientError) {
    console.error(`[error] ${req.requestId || '-'} ${req.method} ${req.path}`, err.message, err.stack);
  }

  return res.status(status).json({
    success: false,
    message: isClientError ? err.message : 'An unexpected error occurred',
    requestId: req.requestId || null,
    timestamp: new Date().toISOString(),
  });
}

module.exports = errorHandler;
