const express = require('express');
const prisma = require('../db');

const router = express.Router();

// Safe health check handler
router.get('/', async (req, res) => {
  const timestamp = new Date().toISOString();
  const uptime = process.uptime();

  let databaseStatus = 'disconnected';
  let databaseDetails = 'Not connected';

  try {
    if (typeof prisma.$runCommandRaw === 'function') {
      await prisma.$runCommandRaw({ ping: 1 });
      databaseStatus = 'connected';
      databaseDetails = 'Database ping successful';
    } else {
      databaseStatus = 'pending_schema';
      databaseDetails = 'Prisma client waiting for model definition before code generation';
    }
  } catch (error) {
    databaseStatus = 'error';
    // Do not log or expose the connection string or credentials
    databaseDetails = 'Unable to establish database connection';
    console.error('[Health Check DB Warning]: Database ping check failed.');
  }

  // The API service itself is operational
  const statusCode = databaseStatus === 'connected' ? 200 : 200;

  return res.status(statusCode).json({
    status: 'ok',
    service: 'Green-Lantern Backend API',
    timestamp,
    uptime: `${uptime.toFixed(2)}s`,
    database: {
      status: databaseStatus,
      message: databaseDetails,
    },
  });
});

module.exports = router;
