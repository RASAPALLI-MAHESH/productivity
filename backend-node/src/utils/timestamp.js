'use strict';

/**
 * Converts a Firestore Timestamp, JS Date, or ISO string to an ISO string.
 * Returns null if the value is null/undefined.
 */
function toISO(value) {
  if (!value) return null;
  // Firestore Admin Timestamp has a toDate() method
  if (typeof value.toDate === 'function') return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string') return value;
  return null;
}

module.exports = { toISO };
