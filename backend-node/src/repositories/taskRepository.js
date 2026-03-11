'use strict';

const { db } = require('../config/firebase');
const { FieldValue } = require('firebase-admin/firestore');

function col(userId) {
  return db.collection('users').doc(userId).collection('tasks');
}

async function save(userId, task) {
  let ref;
  if (task.id) {
    ref = col(userId).doc(task.id);
  } else {
    ref = col(userId).doc();
    task.id = ref.id;
  }
  task.userId = userId;
  await ref.set(task);
  return task;
}

async function findById(userId, taskId) {
  const doc = await col(userId).doc(taskId).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

async function findAll(userId, { status, priority, sortBy = 'createdAt', sortDirection = 'desc', page = 0, size = 20 } = {}) {
  let query = col(userId);

  if (status) query = query.where('status', '==', status);
  if (priority) query = query.where('priority', '==', priority);

  const direction = sortDirection === 'asc' ? 'asc' : 'desc';
  query = query.orderBy(sortBy, direction);
  query = query.offset(page * size).limit(size);

  const snap = await query.get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

async function count(userId) {
  const snap = await col(userId).count().get();
  return snap.data().count;
}

async function findOverdue(userId) {
  const now = new Date();
  const snap = await col(userId)
    .where('deadline', '<', now)
    .where('status', '!=', 'done')
    .orderBy('deadline', 'asc')
    .get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

async function findByDeadlineRange(userId, start, end) {
  const snap = await col(userId)
    .where('deadline', '>=', start)
    .where('deadline', '<', end)
    .get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

async function remove(userId, taskId) {
  await col(userId).doc(taskId).delete();
}

module.exports = { save, findById, findAll, count, findOverdue, findByDeadlineRange, remove };
