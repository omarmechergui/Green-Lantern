const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const env = require('./config/env');
const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/auth.routes');
const { notFoundHandler, errorHandler } = require('./middleware/error.middleware');

const app = express();

// Parse CORS allowed origins from environment variable (comma-separated or single)
// Filter out wildcards '*' or empty entries to prevent unauthorized origin reflection when credentials are true
const allowedOrigins = (env.CLIENT_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter((origin) => origin.length > 0 && origin !== '*');

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, server-to-server, health checks)
    if (!origin) {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS policy does not allow access from origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
};


// Global Middleware
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);


// Centralized 404 & Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
