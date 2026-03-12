'use strict';

const userService = require('../services/userService');
const { hashPassword, checkPassword } = require('../utils/password');
const { generateOtp, validateOtp } = require('../utils/otp');
const jwtUtil = require('../utils/jwt');
const { success, error } = require('../utils/apiResponse');
const { maskEmail } = require('../utils/helpers');
const config = require('../config/env');
const { auth: firebaseAuth } = require('../config/firebase');

function setRefreshCookie(res, token) {
  res.cookie('refresh_token', token, {
    httpOnly: true,
    secure: config.cookie.secure,
    path: '/',
    maxAge: config.jwt.refreshExpiry * 1000,
    sameSite: 'None',
  });
}

function clearRefreshCookie(res) {
  res.cookie('refresh_token', '', {
    httpOnly: true,
    secure: config.cookie.secure,
    path: '/',
    maxAge: 0,
    sameSite: 'None',
  });
}

function issueTokens(user) {
  const accessToken = jwtUtil.generateAccessToken(user.uid, user.role);
  const refreshToken = jwtUtil.generateRefreshToken(user.uid);
  return { accessToken, refreshToken };
}

// POST /api/v1/auth/signup
async function signup(req, res, next) {
  try {
    const { email, password, displayName } = req.body;
    const normalized = email.toLowerCase().trim();

    const existing = await userService.findByEmail(normalized);
    if (existing) return error(res, 'Email already in use', 409);

    const passwordHash = await hashPassword(password);
    await userService.createUser(normalized, passwordHash, displayName);
    await generateOtp(normalized);

    return success(res, { maskedEmail: maskEmail(normalized), expiresInSeconds: 300 }, 'Account created. Please verify OTP.');
  } catch (err) { next(err); }
}

// POST /api/v1/auth/resend-otp
async function resendOtp(req, res, next) {
  try {
    const email = req.body.email.toLowerCase().trim();
    const user = await userService.findByEmail(email);

    if (!user) {
      // Anti-enumeration — always appear successful
      return success(res, { maskedEmail: maskEmail(email), expiresInSeconds: 300 }, 'If account exists, a new code has been sent.');
    }

    await generateOtp(email);
    return success(res, { maskedEmail: maskEmail(email), expiresInSeconds: 300 }, 'A fresh verification code has been sent.');
  } catch (err) { next(err); }
}

// POST /api/v1/auth/verify-otp
async function verifyOtp(req, res, next) {
  try {
    const { email, otp } = req.body;
    const normalized = email.toLowerCase().trim();

    if (!validateOtp(normalized, otp)) {
      return error(res, 'Invalid or expired OTP', 400);
    }

    const user = await userService.findByEmail(normalized);
    if (!user) return error(res, 'User not found', 404);

    if (!user.verified) {
      await userService.verifyUser(user.uid);
      user.verified = true;
    }

    const { accessToken, refreshToken } = issueTokens(user);
    setRefreshCookie(res, refreshToken);
    const dto = userService.toDTO(user);

    return success(res, { user: dto, tokens: { accessToken, refreshToken } }, 'Email verified');
  } catch (err) { next(err); }
}

// POST /api/v1/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const normalized = email.toLowerCase().trim();

    const user = await userService.findByEmail(normalized);
    if (!user) return error(res, 'Invalid credentials', 401);

    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      return error(res, `Account locked until ${user.lockedUntil}`, 403);
    }

    const valid = await checkPassword(password, user.passwordHash);
    if (!valid) {
      const attempts = (user.loginAttempts || 0) + 1;
      const MAX_ATTEMPTS = 5;
      const LOCK_MINUTES = 30;

      if (attempts >= MAX_ATTEMPTS) {
        const lockedUntil = new Date(Date.now() + LOCK_MINUTES * 60 * 1000).toISOString();
        await userService.lockAccount(user.uid, lockedUntil);
        return error(res, `Account locked due to too many failed attempts. Try again after ${LOCK_MINUTES} minutes.`, 403);
      }

      await userService.incrementLoginAttempts(user.uid, attempts);
      const remaining = MAX_ATTEMPTS - attempts;
      return error(res, `Invalid credentials. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`, 401);
    }

    if (!user.verified) return error(res, 'Email not verified', 403);

    await userService.recordLogin(user.uid);

    const { accessToken, refreshToken } = issueTokens(user);
    setRefreshCookie(res, refreshToken);
    const dto = userService.toDTO(user);

    return success(res, { user: dto, tokens: { accessToken, refreshToken } }, 'Login successful');
  } catch (err) { next(err); }
}

// POST /api/v1/auth/google
async function googleAuth(req, res, next) {
  try {
    const { token: idToken } = req.body;

    let decoded;
    try {
      decoded = await firebaseAuth.verifyIdToken(idToken);
    } catch {
      return error(res, 'Invalid Google Authentication', 401);
    }

    const { email, name: displayName } = decoded;
    if (!email) return error(res, 'Google token missing email', 400);

    let user = await userService.findByEmail(email);

    if (!user) {
      const { v4: uuidv4 } = require('uuid');
      const passwordHash = await hashPassword(uuidv4()); // random, unusable password
      user = await userService.createUser(email, passwordHash, displayName);
      await userService.verifyUser(user.uid);
      user.verified = true;
    } else {
      if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
        return error(res, `Account locked until ${user.lockedUntil}`, 403);
      }
      if (!user.verified) {
        await userService.verifyUser(user.uid);
        user.verified = true;
      }
    }

    await userService.recordLogin(user.uid);
    const { accessToken, refreshToken } = issueTokens(user);
    setRefreshCookie(res, refreshToken);
    const dto = userService.toDTO(user);

    return success(res, { user: dto, tokens: { accessToken, refreshToken } }, 'Google login successful');
  } catch (err) { next(err); }
}

// POST /api/v1/auth/refresh
async function refresh(req, res, next) {
  try {
    // Accept token from httpOnly cookie (web) OR request body (mobile)
    const refreshToken = req.cookies?.refresh_token || req.body?.refreshToken;
    if (!refreshToken || !jwtUtil.isTokenValid(refreshToken)) {
      return error(res, 'Invalid refresh token', 401);
    }

    const uid = jwtUtil.extractUid(refreshToken);
    const user = await userService.getUserModel(uid);

    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      return error(res, 'Account locked', 403);
    }
    if (!user.verified) return error(res, 'Email not verified', 403);

    const newAccessToken = jwtUtil.generateAccessToken(uid, user.role);
    const newRefreshToken = jwtUtil.generateRefreshToken(uid);
    setRefreshCookie(res, newRefreshToken);

    const dto = userService.toDTO(user);
    return success(res, { user: dto, tokens: { accessToken: newAccessToken, refreshToken: newRefreshToken } }, 'Token refreshed');
  } catch (err) { next(err); }
}

// POST /api/v1/auth/logout
async function logout(req, res) {
  clearRefreshCookie(res);
  return res.status(200).json({ success: true, message: 'Logged out' });
}

// POST /api/v1/auth/forgot-password
async function forgotPassword(req, res, next) {
  try {
    const email = req.body.email.toLowerCase().trim();
    const user = await userService.findByEmail(email);

    if (!user) {
      return success(res, { maskedEmail: maskEmail(email), expiresInSeconds: 300 }, 'If account exists, OTP sent');
    }

    await generateOtp(email);
    return success(res, { maskedEmail: maskEmail(email), expiresInSeconds: 300 }, 'Password reset OTP sent');
  } catch (err) { next(err); }
}

// POST /api/v1/auth/verify-reset-otp
async function verifyResetOtp(req, res, next) {
  try {
    const { email, otp } = req.body;
    const normalized = email.toLowerCase().trim();

    if (!validateOtp(normalized, otp)) {
      return error(res, 'Invalid or expired OTP', 400);
    }

    const resetToken = jwtUtil.generateResetToken(normalized);
    return success(res, { resetToken }, 'OTP verified. Use resetToken to reset your password.');
  } catch (err) { next(err); }
}

// POST /api/v1/auth/reset-password
async function resetPassword(req, res, next) {
  try {
    const { resetToken, newPassword } = req.body;

    let payload;
    try {
      payload = jwtUtil.verifyToken(resetToken);
    } catch {
      return error(res, 'Invalid or expired reset token', 400);
    }

    if (payload.purpose !== 'reset') {
      return error(res, 'Invalid reset token', 400);
    }

    const email = payload.sub;
    const user = await userService.findByEmail(email);
    if (!user) return error(res, 'User not found', 404);

    const newHash = await hashPassword(newPassword);
    await userService.updatePassword(user.uid, newHash);

    return success(res, null, 'Password reset successfully');
  } catch (err) { next(err); }
}

module.exports = {
  signup, resendOtp, verifyOtp, login, googleAuth,
  refresh, logout, forgotPassword, verifyResetOtp, resetPassword,
};
