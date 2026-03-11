'use strict';

const userService = require('../services/userService');
const { success, error } = require('../utils/apiResponse');

// GET /api/v1/users/me
async function getProfile(req, res, next) {
  try {
    const user = await userService.getUser(req.uid);
    return success(res, user);
  } catch (err) { next(err); }
}

// POST /api/v1/users/onboarding
async function completeOnboarding(req, res, next) {
  try {
    const { bio } = req.body;
    const user = await userService.completeOnboarding(req.uid, bio);
    return success(res, user, 'Onboarding completed');
  } catch (err) { next(err); }
}

// PUT /api/v1/users/me
async function updateProfile(req, res, next) {
  try {
    const { displayName, bio, photoURL } = req.body;
    const user = await userService.updateProfile(req.uid, displayName, bio, photoURL);
    return success(res, user, 'Profile updated successfully');
  } catch (err) { next(err); }
}

// DELETE /api/v1/users/me
async function deleteAccount(req, res, next) {
  try {
    await userService.deleteUser(req.uid);
    return success(res, null, 'Account deleted successfully');
  } catch (err) { next(err); }
}

module.exports = { getProfile, completeOnboarding, updateProfile, deleteAccount };
