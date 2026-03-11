'use strict';

const { db } = require('../config/firebase');

function col(userId) {
  return db.collection('users').doc(userId).collection('habits');
}

async function save(userId, habit) {
  let ref;
  if (habit.id) {
    ref = col(userId).doc(habit.id);
  } else {
    ref = col(userId).doc();
    habit.id = ref.id;
  }
  habit.userId = userId;
  await ref.set(habit);
  return habit;
}

async function findById(userId, habitId) {
  const doc = await col(userId).doc(habitId).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

async function findAll(userId) {
  const snap = await col(userId).orderBy('createdAt', 'desc').get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

async function remove(userId, habitId) {
  await col(userId).doc(habitId).delete();
}

module.exports = { save, findById, findAll, remove };
