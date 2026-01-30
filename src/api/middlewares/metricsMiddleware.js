const metricsCollector = require('../../infrastructure/monitoring/MetricsCollector');

/**
 * Middleware to collect request metrics
 */
const metricsMiddleware = (req, res, next) => {
  res.on('finish', () => {
    const endpoint = req.route 
      ? `${req.method} ${req.route.path}` 
      : `${req.method} ${req.path}`;
    
    metricsCollector.recordRequest(
      req.method,
      endpoint,
      res.statusCode
    );
  });
  
  next();
};

module.exports = metricsMiddleware;