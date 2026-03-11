'use strict';

module.exports = {
  port: process.env.PORT || 8080,
  nodeEnv: process.env.NODE_ENV || 'development',

  jwt: {
    secret: process.env.JWT_SECRET || 'changeme-use-a-real-secret-in-production-min32chars',
    accessExpiry: parseInt(process.env.JWT_ACCESS_EXPIRY || '900', 10),    // seconds
    refreshExpiry: parseInt(process.env.JWT_REFRESH_EXPIRY || '604800', 10), // seconds
  },

  cookie: {
    secure: process.env.COOKIE_SECURE === 'true',
  },

  cors: {
    allowedOrigins: (process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:5173').split(',').map(o => o.trim()),
  },

  brevo: {
    apiKey: process.env.BREVO_API_KEY || '',
    from: process.env.MAIL_FROM || 'no-reply@productiv.app',
  },

  firebase: {
    credentials: process.env.FIREBASE_CREDENTIALS || null,
    serviceAccountPath: process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './firebase-service-account.json',
  },
};
