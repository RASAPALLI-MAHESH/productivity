'use strict';

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');
const config = require('./env');

let db;
let auth;

function initFirebase() {
  if (admin.apps.length > 0) {
    db = admin.firestore();
    auth = admin.auth();
    return;
  }

  let credential;

  if (config.firebase.credentials) {
    // Env var contains full JSON string
    const serviceAccount = JSON.parse(config.firebase.credentials);
    credential = admin.credential.cert(serviceAccount);
  } else {
    // Resolve path relative to project root (where server.js lives)
    const resolvedPath = path.resolve(process.cwd(), config.firebase.serviceAccountPath);
    const serviceAccount = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
    credential = admin.credential.cert(serviceAccount);
  }

  admin.initializeApp({ credential });

  db = admin.firestore();
  auth = admin.auth();
  console.log('[firebase] Initialized Firestore & Auth');
}

initFirebase();

module.exports = { db, auth };
