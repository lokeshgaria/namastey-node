 

/**
 * Middleware to collect request metrics
 */
const metricsMiddleware = (req, res, next) => {
  res.on('finish', () => {
    const endpoint = req.route 
      ? `${req.method} ${req.route.path}` 
      : `${req.method} ${req.path}`;
    
  
  });
  
  next();
};

module.exports = metricsMiddleware;