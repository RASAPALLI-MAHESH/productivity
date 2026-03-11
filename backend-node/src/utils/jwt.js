'use strict';

const jwt = require('jsonwebtoken');
const config = require('../config/env');

function generateAccessToken(uid, role) {
  return jwt.sign({ sub: uid, role }, config.jwt.secret, {
    expiresIn: config.jwt.accessExpiry,
    algorithm: 'HS256',
  });
}

function generateRefreshToken(uid) {
  return jwt.sign({ sub: uid }, config.jwt.secret, {
    expiresIn: config.jwt.refreshExpiry,
    algorithm: 'HS256',
  });
}

function generateResetToken(email) {
  return jwt.sign({ sub: email, purpose: 'reset' }, config.jwt.secret, {
    expiresIn: 600, // 10 minutes
    algorithm: 'HS256',
  });
}

function verifyToken(token) {
  return jwt.verify(token, config.jwt.secret, { algorithms: ['HS256'] });
}

function isTokenValid(token) {
  try {
    verifyToken(token);
    return true;
  } catch {
    return false;
  }
}

function extractUid(token) {
  const decoded = jwt.decode(token);
  return decoded?.sub || null;
}

module.exports = { generateAccessToken, generateRefreshToken, generateResetToken, verifyToken, isTokenValid, extractUid };
