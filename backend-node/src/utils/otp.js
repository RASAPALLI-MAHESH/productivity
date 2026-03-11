'use strict';

const crypto = require('crypto');
const { sendHtmlMessage } = require('./email');
const { getOtpTemplate } = require('./emailTemplates');

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes

// In-memory store — replace with Redis for multi-instance deployments
const store = new Map();

// Clean up expired OTPs every minute
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of store.entries()) {
    if (now > data.expiresAt) store.delete(key);
  }
}, 60 * 1000);

function generateNumeric6() {
  // Secure random 0–999999, zero-padded to 6 chars
  const buf = crypto.randomInt(0, 1_000_000);
  return String(buf).padStart(6, '0');
}

async function generateOtp(email) {
  const otp = generateNumeric6();
  store.set(email, { otp, expiresAt: Date.now() + OTP_TTL_MS });

  const subject = `Your Verification Code: ${otp}`;
  const html = getOtpTemplate(otp);

  // Fire-and-forget
  sendHtmlMessage(email, subject, html).catch(err =>
    console.error('[otp] Email send error:', err.message)
  );

  return otp;
}

function validateOtp(email, otp) {
  const data = store.get(email);
  if (!data) return false;
  if (Date.now() > data.expiresAt) {
    store.delete(email);
    return false;
  }
  if (data.otp === otp) {
    store.delete(email); // one-time use
    return true;
  }
  return false;
}

module.exports = { generateOtp, validateOtp };
