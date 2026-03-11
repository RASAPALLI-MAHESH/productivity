'use strict';
require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 8080;

const server = app.listen(PORT, () => {
  console.log(`[server] Productiv backend running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
});

// ─── Graceful Shutdown ───────────────────────────────────────────────────────
function shutdown(signal) {
  console.log(`[server] ${signal} received. Gracefully shutting down...`);
  server.close(() => {
    console.log('[server] HTTP server closed.');
    process.exit(0);
  });

  // Force exit if connections don't close in 10s
  setTimeout(() => {
    console.error('[server] Forced shutdown after timeout.');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

process.on('uncaughtException', (err) => {
  console.error('[server] Uncaught exception:', err);
  shutdown('uncaughtException');
});

process.on('unhandledRejection', (reason) => {
  console.error('[server] Unhandled rejection:', reason);
});
