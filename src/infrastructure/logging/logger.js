const winston = require('winston');
const path = require('path');
const DailyRotateFile = require('winston-daily-rotate-file');

// Create logs directory if it doesn't exist
const fs = require('fs');
const logsDir = path.join(__dirname, '../../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// ============================================
// LOG LEVELS
// ============================================
// error: 0, warn: 1, info: 2, http: 3, verbose: 4, debug: 5, silly: 6

// ============================================
// CUSTOM LOG FORMAT
// ============================================
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Console format (colored and readable)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    
    // Add metadata if exists
    if (Object.keys(meta).length > 0) {
      // Don't log timestamp again
      delete meta.timestamp;
      if (Object.keys(meta).length > 0) {
        msg += ` ${JSON.stringify(meta)}`;
      }
    }
    
    return msg;
  })
);

// ============================================
// TRANSPORTS (Where logs go)
// ============================================

// Transport 1: Error logs (only errors)
const errorFileTransport = new DailyRotateFile({
  filename: path.join(logsDir, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  level: 'error',
  maxSize: '20m',  // Rotate when file reaches 20MB
  maxFiles: '14d', // Keep logs for 14 days
  format: customFormat
});

// Transport 2: Combined logs (all levels)
const combinedFileTransport = new DailyRotateFile({
  filename: path.join(logsDir, 'combined-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  format: customFormat
});

// Transport 3: HTTP logs (requests)
const httpFileTransport = new DailyRotateFile({
  filename: path.join(logsDir, 'http-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  level: 'http',
  maxSize: '20m',
  maxFiles: '7d',  // Keep for 7 days
  format: customFormat
});

// Transport 4: Database query logs
const dbFileTransport = new DailyRotateFile({
  filename: path.join(logsDir, 'database-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  level: 'debug',
  maxSize: '20m',
  maxFiles: '7d',
  format: customFormat
});

// Transport 5: Console (development only)
const consoleTransport = new winston.transports.Console({
  format: consoleFormat,
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
});

// ============================================
// CREATE LOGGER
// ============================================
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: customFormat,
  defaultMeta: { 
    service: 'devtinder-api',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    errorFileTransport,
    combinedFileTransport,
    httpFileTransport,
    dbFileTransport,
    consoleTransport
  ],
  
  // Handle uncaught exceptions
  exceptionHandlers: [
    new winston.transports.File({ 
      filename: path.join(logsDir, 'exceptions.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    consoleTransport
  ],
  
  // Handle unhandled promise rejections
  rejectionHandlers: [
    new winston.transports.File({ 
      filename: path.join(logsDir, 'rejections.log'),
      maxsize: 5242880,
      maxFiles: 5
    }),
    consoleTransport
  ],
  
  exitOnError: false
});

// ============================================
// HELPER METHODS (Structured Logging)
// ============================================

/**
 * Log HTTP request
 */
logger.logRequest = (req, meta = {}) => {
  logger.http('HTTP Request', {
    method: req.method,
    url: req.url,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.headers['user-agent'],
    userId: req.user?._id,
    requestId: req.id,
    ...meta
  });
};

/**
 * Log HTTP response
 */
logger.logResponse = (req, res, duration, meta = {}) => {
  const level = res.statusCode >= 400 ? 'warn' : 'http';
  
  logger.log(level, 'HTTP Response', {
    method: req.method,
    url: req.url,
    statusCode: res.statusCode,
    duration: `${duration}ms`,
    userId: req.user?._id,
    requestId: req.id,
    ...meta
  });
};

/**
 * Log application error with context
 */
logger.logError = (error, context = {}) => {
  logger.error('Application Error', {
    message: error.message,
    stack: error.stack,
    name: error.name,
    code: error.code,
    ...context
  });
};

/**
 * Log database query
 */
logger.logDatabaseQuery = (operation, collection, duration, meta = {}) => {
  const level = duration > 100 ? 'warn' : 'debug';
  
  logger.log(level, 'Database Query', {
    operation,
    collection,
    duration: `${duration}ms`,
    slow: duration > 100,
    ...meta
  });
};

/**
 * Log cache operation
 */
logger.logCache = (operation, key, hit = false, meta = {}) => {
  logger.debug('Cache Operation', {
    operation,
    key,
    hit,
    ...meta
  });
};

/**
 * Log authentication event
 */
logger.logAuth = (event, userId, meta = {}) => {
  logger.info('Authentication Event', {
    event,
    userId,
    timestamp: new Date().toISOString(),
    ...meta
  });
};

/**
 * Log business event
 */
logger.logBusinessEvent = (event, data = {}) => {
  logger.info('Business Event', {
    event,
    timestamp: new Date().toISOString(),
    ...data
  });
};

// ============================================
// STARTUP LOG
// ============================================
logger.info('Logger initialized', {
  logLevel: logger.level,
  environment: process.env.NODE_ENV,
  logsDirectory: logsDir
});

module.exports = logger;