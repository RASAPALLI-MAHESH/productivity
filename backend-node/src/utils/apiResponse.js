'use strict';

function success(res, data, message, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message: message || undefined,
    data,
    timestamp: new Date().toISOString(),
  });
}

function paginated(res, data, totalPages, totalElements) {
  return res.status(200).json({
    success: true,
    data,
    totalPages,
    totalElements,
    timestamp: new Date().toISOString(),
  });
}

function error(res, message, statusCode = 400) {
  return res.status(statusCode).json({
    success: false,
    message,
    timestamp: new Date().toISOString(),
  });
}

module.exports = { success, paginated, error };
