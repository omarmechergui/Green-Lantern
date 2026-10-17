const app = require('./app');
const env = require('./config/env');
const prisma = require('./db');

const PORT = env.PORT;

const server = app.listen(PORT, () => {
  console.log(`[Green-Lantern Backend] Server running in ${env.NODE_ENV} mode on port ${PORT}`);
  console.log(`[Green-Lantern Backend] Health endpoint: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown handler
async function handleShutdown(signal) {
  console.log(`\n[Shutdown] Received ${signal}. Starting graceful shutdown...`);

  // Close HTTP server to stop accepting new requests
  server.close(async () => {
    console.log('[Shutdown] HTTP server closed.');

    try {
      // Disconnect Prisma client cleanly
      await prisma.$disconnect();
      console.log('[Shutdown] Prisma client disconnected.');
      process.exit(0);
    } catch (err) {
      console.error('[Shutdown Error] Failed to disconnect Prisma client cleanly:', err.message);
      process.exit(1);
    }
  });

  // Force shutdown after timeout if graceful close hangs
  setTimeout(() => {
    console.error('[Shutdown] Forced shutdown timed out. Exiting immediately.');
    process.exit(1);
  }, 10000).unref();
}

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
