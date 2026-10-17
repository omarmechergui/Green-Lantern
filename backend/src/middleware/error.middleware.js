const env = require('../config/env');

// Centralized 404 handler for unmatched routes
function notFoundHandler(req, res, next) {
  res.status(404).json({
    status: 'error',
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
}

// Centralized error handler
function errorHandler(err, req, res, next) {
  const statusCode = err.status || err.statusCode || 500;
  
  // Safe logging: log internal error message, avoid exposing credentials
  console.error(`[Error] ${req.method} ${req.originalUrl} - ${err.message || 'Internal Server Error'}`);

  const response = {
    status: 'error',
    message: statusCode === 500 && env.NODE_ENV === 'production'
      ? 'Internal server error'
      : (err.message || 'An unexpected error occurred'),
  };

  // Only expose stack trace in non-production environments
  if (env.NODE_ENV !== 'production' && err.stack) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
