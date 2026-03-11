'use strict';

const { v4: uuidv4 } = require('uuid');
const userRepo = require('../repositories/userRepository');
const { sendSimpleMessage } = require('../utils/email');
const { toISO } = require('../utils/timestamp');

async function createOrUpdateGoogleUser(uid, email, displayName, photoURL) {
  const normalizedEmail = email ? email.toLowerCase().trim() : null;
  let user = await userRepo.findById(uid);

  if (!user) {
    user = {
      uid,
      email: normalizedEmail,
      displayName: displayName || null,
      photoURL: photoURL || null,
      role: 'user',
      onboarded: false,
      verified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await userRepo.save(user);
  } else {
    const updates = { updatedAt: new Date().toISOString() };
    if (normalizedEmail) updates.email = normalizedEmail;
    if (displayName) updates.displayName = displayName;
    if (photoURL) updates.photoURL = photoURL;
    user = await userRepo.update(uid, updates);
  }

  return toDTO(user);
}

async function createUser(email, passwordHash, displayName) {
  const normalizedEmail = email ? email.toLowerCase().trim() : null;
  const uid = uuidv4();

  const user = {
    uid,
    email: normalizedEmail,
    passwordHash,
    displayName: displayName || null,
    photoURL: null,
    role: 'user',
    onboarded: false,
    verified: false,
    loginAttempts: 0,
    lockedUntil: null,
    lastLogin: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await userRepo.save(user);
  return user;
}

async function findByEmail(email) {
  if (!email) return null;
  return userRepo.findByEmail(email.toLowerCase().trim());
}

async function getUser(uid) {
  const user = await userRepo.findById(uid);
  if (!user) throw Object.assign(new Error(`User not found: ${uid}`), { status: 404 });
  return toDTO(user);
}

async function getUserModel(uid) {
  const user = await userRepo.findById(uid);
  if (!user) throw Object.assign(new Error(`User not found: ${uid}`), { status: 404 });
  return user;
}

async function verifyUser(uid) {
  await userRepo.update(uid, { verified: true, updatedAt: new Date().toISOString() });
}

async function recordLogin(uid) {
  await userRepo.update(uid, {
    lastLogin: new Date().toISOString(),
    loginAttempts: 0,
    lockedUntil: null,
    updatedAt: new Date().toISOString(),
  });
}

async function incrementLoginAttempts(uid, attempts) {
  await userRepo.update(uid, {
    loginAttempts: attempts,
    updatedAt: new Date().toISOString(),
  });
}

async function lockAccount(uid, lockedUntil) {
  await userRepo.update(uid, {
    loginAttempts: 5,
    lockedUntil,
    updatedAt: new Date().toISOString(),
  });
}

async function updatePassword(uid, newPasswordHash) {
  await userRepo.update(uid, { passwordHash: newPasswordHash, updatedAt: new Date().toISOString() });
}

async function completeOnboarding(uid, bio) {
  const user = await userRepo.update(uid, {
    bio,
    onboarded: true,
    updatedAt: new Date().toISOString(),
  });
  return toDTO(user);
}

async function updateProfile(uid, displayName, bio, photoURL) {
  const updates = { updatedAt: new Date().toISOString() };
  if (displayName != null) updates.displayName = displayName;
  if (bio != null) updates.bio = bio;
  if (photoURL != null) updates.photoURL = photoURL;
  const user = await userRepo.update(uid, updates);
  return toDTO(user);
}

async function deleteUser(uid) {
  const user = await userRepo.findById(uid);
  const email = user?.email;
  const displayName = user?.displayName;

  await userRepo.remove(uid);

  if (email) {
    sendSimpleMessage(
      email,
      'Your Productiv Account Has Been Deleted',
      `Hi ${displayName || 'there'},<br><br>Your Productiv account has been permanently deleted and all associated data removed.<br><br>If you did not request this, please contact support immediately.<br><br>The Productiv Team`
    ).catch(() => {});
  }
}

function toDTO(user) {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    role: user.role,
    onboarded: user.onboarded,
    bio: user.bio || null,
    verified: user.verified,
    loginAttempts: user.loginAttempts || 0,
    lockedUntil: toISO(user.lockedUntil),
    lastLogin: toISO(user.lastLogin),
    createdAt: toISO(user.createdAt),
    xp: user.xp || 0,
    level: user.level || 1,
    totalTasksCompleted: user.totalTasksCompleted || 0,
    streakBest: user.streakBest || 0,
  };
}

module.exports = {
  createOrUpdateGoogleUser,
  createUser,
  findByEmail,
  getUser,
  getUserModel,
  verifyUser,
  recordLogin,
  incrementLoginAttempts,
  lockAccount,
  updatePassword,
  completeOnboarding,
  updateProfile,
  deleteUser,
  toDTO,
};
