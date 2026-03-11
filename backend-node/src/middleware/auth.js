'use strict';

const jwtUtil = require('../utils/jwt');
const { error } = require('../utils/apiResponse');

function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return error(res, 'Missing or invalid Authorization header', 401);
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwtUtil.verifyToken(token);
    req.uid = payload.sub;
    req.role = payload.role || 'user';
    return next();
  } catch {
    return error(res, 'Invalid or expired access token', 401);
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.role)) {
      return error(res, 'Insufficient permissions', 403);
    }
    return next();
  };
}

module.exports = { authenticate, requireRole };
