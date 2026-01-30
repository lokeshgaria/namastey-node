//requestLogger.js
const { v4: uuidv4 } = require('uuid');
const logger = require('../../infrastructure/logging/logger');

/**
 * Request logging middleware
 * Logs every HTTP request and response with timing
 */
const requestLogger = (req, res, next) => {
  // Add unique request ID
  req.id = uuidv4();
  
  // Record start time
  const startTime = Date.now();
  
  // Log incoming request
  logger.logRequest(req);

  // Capture response
  const originalJson = res.json.bind(res);
  const originalSend = res.send.bind(res);

  // Override res.json
  res.json = function(data) {
    const duration = Date.now() - startTime;
    logger.logResponse(req, res, duration, {
      responseSize: JSON.stringify(data).length
    });
    return originalJson(data);
  };

  // Override res.send
  res.send = function(data) {
    const duration = Date.now() - startTime;
    logger.logResponse(req, res, duration, {
      responseSize: typeof data === 'string' ? data.length : 0
    });
    return originalSend(data);
  };

  // Handle response finish (for cases where json/send aren't called)
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    // Log slow requests (> 1 second)
    if (duration > 1000) {
      logger.warn('Slow Request Detected', {
        method: req.method,
        url: req.url,
        duration: `${duration}ms`,
        requestId: req.id,
        userId: req.user?._id
      });
    }
  });

  next();
};

module.exports = requestLogger;