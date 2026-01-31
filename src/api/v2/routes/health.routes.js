const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const metricsCollector = require('../../../infrastructure/monitoring/MetricsCollector');
const logger = require('../../../infrastructure/logging/logger');

/**
 * Setup health check routes
 */
function setupHealthRoutes(redisClient, cacheService) {
  
  /**
   * GET /health - Basic health check
   */
  router.get('/', async (req, res) => {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: 'unknown',
        cache: 'unknown'
      }
    };

    // Check MongoDB
    try {
      health.services.database = mongoose.connection.readyState === 1 
        ? 'healthy' 
        : 'unhealthy';
    } catch (error) {
      health.services.database = 'unhealthy';
    }

    // Check Redis
    try {
      health.services.cache = redisClient.isConnected 
        ? 'healthy' 
        : 'unhealthy';
    } catch (error) {
      health.services.cache = 'unhealthy';
    }

    // Overall status
    const isHealthy = health.services.database === 'healthy' && 
                      health.services.cache === 'healthy';
    
    health.status = isHealthy ? 'healthy' : 'degraded';

    const statusCode = isHealthy ? 200 : 503;
    
    logger.info('Health check performed', { status: health.status });
    
    res.status(statusCode).json(health);
  });

  /**
   * GET /health/detailed - Detailed health check
   */
  router.get('/detailed', async (req, res) => {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: {
        process: process.uptime(),
        system: require('os').uptime()
      },
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      services: {},
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    };

    // MongoDB Health
    try {
      const dbState = mongoose.connection.readyState;
      const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
      
      health.services.mongodb = {
        status: dbState === 1 ? 'healthy' : 'unhealthy',
        state: states[dbState],
        host: mongoose.connection.host,
        name: mongoose.connection.name
      };
    } catch (error) {
      health.services.mongodb = {
        status: 'unhealthy',
        error: error.message
      };
    }

    // Redis Health
    try {
      health.services.redis = {
        status: redisClient.isConnected ? 'healthy' : 'unhealthy',
        connected: redisClient.isConnected
      };

      // Get Redis info if available
      if (redisClient.isConnected) {
        const cacheMetrics = cacheService.getMetrics();
        health.services.redis.metrics = cacheMetrics;
      }
    } catch (error) {
      health.services.redis = {
        status: 'unhealthy',
        error: error.message
      };
    }

    // Overall status
    const isHealthy = health.services.mongodb?.status === 'healthy' && 
                      health.services.redis?.status === 'healthy';
    
    health.status = isHealthy ? 'healthy' : 'degraded';

    const statusCode = isHealthy ? 200 : 503;
    
    res.status(statusCode).json(health);
  });

  /**
   * GET /health/metrics - Application metrics
   */
  router.get('/metrics', (req, res) => {
    const metrics = metricsCollector.getMetrics();
    
    res.json({
      success: true,
      data: metrics
    });
  });

  /**
   * GET /health/cache - Cache metrics
   */
  router.get('/cache', (req, res) => {
    const cacheMetrics = cacheService.getMetrics();
    
    res.json({
      success: true,
      data: cacheMetrics
    });
  });

  /**
   * POST /health/metrics/reset - Reset metrics
   */
  router.post('/metrics/reset', (req, res) => {
    metricsCollector.reset();
    
    logger.info('Metrics manually reset');
    
    res.json({
      success: true,
      message: 'Metrics reset successfully'
    });
  });

  return router;
}

module.exports = setupHealthRoutes;