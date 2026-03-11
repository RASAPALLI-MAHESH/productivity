'use strict';

function maskEmail(email) {
  if (!email || !email.includes('@')) return email;
  const [local, domain] = email.split('@');
  const visible = local.slice(0, 2);
  const masked = '*'.repeat(Math.max(local.length - 2, 2));
  return `${visible}${masked}@${domain}`;
}

/**
 * Converts any date-like value to an ISO 8601 string.
 * Handles:
 *   - Firestore Timestamp objects (admin SDK — have .toDate())
 *   - Plain JS Date objects
 *   - ISO strings (passed through)
 *   - null / undefined → null
 */
function toISO(val) {
  if (!val) return null;
  if (typeof val.toDate === 'function') return val.toDate().toISOString(); // Firestore Timestamp
  if (val instanceof Date) return val.toISOString();
  if (typeof val === 'string') return val;
  // Firestore Timestamp-like plain object with _seconds (serialised)
  if (typeof val._seconds === 'number') return new Date(val._seconds * 1000).toISOString();
  return null;
}

module.exports = { maskEmail, toISO };
