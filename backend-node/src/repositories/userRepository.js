'use strict';

const { db } = require('../config/firebase');

const COLLECTION = 'users';

function col() {
  return db.collection(COLLECTION);
}

async function save(user) {
  await col().doc(user.uid).set(user);
  return user;
}

async function findById(uid) {
  const doc = await col().doc(uid).get();
  if (!doc.exists) return null;
  return { uid: doc.id, ...doc.data() };
}

async function findByEmail(email) {
  const snap = await col().where('email', '==', email).limit(1).get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { uid: doc.id, ...doc.data() };
}

async function update(uid, updates) {
  await col().doc(uid).update(updates);
  return findById(uid);
}

async function remove(uid) {
  await col().doc(uid).delete();
}

module.exports = { save, findById, findByEmail, update, remove };
