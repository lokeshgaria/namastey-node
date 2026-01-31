/**
 * Global error handling middleware
 */
const logger = require('../../infrastructure/logging/logger');

function errorHandler(err, req, res, next) {

  // log the errror with full contexxt
  logger.logError(err, {
    requestId: req.id,
    method: req.method,
    url: req.url,
    userId: req.user?._id,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    body: req.body,
    query: req.query,
    params: req.params
  })
  console.error('Error occurred:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method,
    userId: req.user?._id
  });

  // Default error
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let errorType = err.name || 'Error';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(e => e.message).join(', ');
    errorType = "ValidationError";

    logger.warn('Validation Error', {
      requestId: req.id,
      errors: err.errors
    })


  }

  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
    errorType = "CastError"
  }

  if (err.code === 11000) {
    statusCode = 409;
    message = 'Duplicate entry exists';
    errorType = 'DuplicateError'

    logger.warn('Duplicate Entry', {
      requestId: req.id,
      errors: err.keyPattern
    })

  }

  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    errorType = 'AuthenticationError';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    errorType = 'AuthenticationError';
  }

  // Send response
  res.status(statusCode).json({
    success: false,
    error: {
      type: errorType,
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack, requestId: req.id })
    }

  });
}

module.exports = errorHandler;