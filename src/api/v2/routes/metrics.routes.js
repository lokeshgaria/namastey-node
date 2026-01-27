const express = require('express');
const router = express.Router();

function setupMetricsRoutes(cacheService) {
  // GET /metrics/cache
  router.get('/cache', (req, res) => {
    const metrics = cacheService.getMetrics();
    
    res.json({
      success: true,
      data: metrics
    });
  });

  // POST /metrics/cache/reset
  router.post('/cache/reset', (req, res) => {
    cacheService.resetMetrics();
    
    res.json({
      success: true,
      message: 'Cache metrics reset'
    });
  });

  return router;
}

module.exports = setupMetricsRoutes;