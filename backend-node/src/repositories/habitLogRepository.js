'use strict';

const { db } = require('../config/firebase');
const { FieldPath } = require('firebase-admin/firestore');

function col(userId, habitId) {
  return db.collection('users').doc(userId).collection('habits').doc(habitId).collection('logs');
}

async function save(userId, habitId, log) {
  await col(userId, habitId).doc(log.date).set(log);
  return log;
}

async function findByDate(userId, habitId, date) {
  const doc = await col(userId, habitId).doc(date).get();
  if (!doc.exists) return null;
  return { date: doc.id, ...doc.data() };
}

async function findByDateRange(userId, habitId, startDate, endDate) {
  const snap = await col(userId, habitId)
    .where(FieldPath.documentId(), '>=', startDate)
    .where(FieldPath.documentId(), '<=', endDate)
    .get();
  return snap.docs.map(d => ({ date: d.id, ...d.data() }));
}

module.exports = { save, findByDate, findByDateRange };
