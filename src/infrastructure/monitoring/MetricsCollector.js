const logger = require('../logging/logger');

class MetricsCollector {
  constructor() {
    this.metrics = {
      requests: {
        total: 0,
        success: 0,
        errors: 0,
        byMethod: {},
        byEndpoint: {},
        byStatusCode: {}
      },
      database: {
        queries: 0,
        slowQueries: 0,
        errors: 0,
        totalDuration: 0
      },
      cache: {
        hits: 0,
        misses: 0,
        errors: 0
      },
      auth: {
        logins: 0,
        signups: 0,
        failures: 0
      },
      business: {
        connectionsSent: 0,
        connectionsAccepted: 0,
        connectionsRejected: 0,
        messagesExchanged: 0
      }
    };
    
    this.startTime = Date.now();
    
    // Log metrics every 5 minutes
    this.setupPeriodicLogging();
  }

  // ============================================
  // REQUEST METRICS
  // ============================================
  
  recordRequest(method, endpoint, statusCode) {
    this.metrics.requests.total++;
    
    // Success/Error
    if (statusCode >= 200 && statusCode < 400) {
      this.metrics.requests.success++;
    } else {
      this.metrics.requests.errors++;
    }

    // By Method
    this.metrics.requests.byMethod[method] = 
      (this.metrics.requests.byMethod[method] || 0) + 1;

    // By Endpoint
    if (!this.metrics.requests.byEndpoint[endpoint]) {
      this.metrics.requests.byEndpoint[endpoint] = { 
        count: 0, 
        errors: 0,
        avgDuration: 0
      };
    }
    this.metrics.requests.byEndpoint[endpoint].count++;
    
    if (statusCode >= 400) {
      this.metrics.requests.byEndpoint[endpoint].errors++;
    }

    // By Status Code
    this.metrics.requests.byStatusCode[statusCode] = 
      (this.metrics.requests.byStatusCode[statusCode] || 0) + 1;
  }

  // ============================================
  // DATABASE METRICS
  // ============================================
  
  recordDatabaseQuery(duration, collection, operation) {
    this.metrics.database.queries++;
    this.metrics.database.totalDuration += duration;
    
    if (duration > 100) {
      this.metrics.database.slowQueries++;
      logger.warn('Slow Database Query', {
        collection,
        operation,
        duration: `${duration}ms`
      });
    }
  }

  recordDatabaseError() {
    this.metrics.database.errors++;
  }

  // ============================================
  // CACHE METRICS
  // ============================================
  
  recordCacheHit() {
    this.metrics.cache.hits++;
  }

  recordCacheMiss() {
    this.metrics.cache.misses++;
  }

  recordCacheError() {
    this.metrics.cache.errors++;
  }

  // ============================================
  // AUTH METRICS
  // ============================================
  
  recordLogin(success = true) {
    if (success) {
      this.metrics.auth.logins++;
    } else {
      this.metrics.auth.failures++;
    }
  }

  recordSignup() {
    this.metrics.auth.signups++;
  }

  // ============================================
  // BUSINESS METRICS
  // ============================================
  
  recordConnectionSent() {
    this.metrics.business.connectionsSent++;
  }

  recordConnectionAccepted() {
    this.metrics.business.connectionsAccepted++;
  }

  recordConnectionRejected() {
    this.metrics.business.connectionsRejected++;
  }

  recordMessage() {
    this.metrics.business.messagesExchanged++;
  }

  // ============================================
  // GET METRICS
  // ============================================
  
  getMetrics() {
    const uptime = Date.now() - this.startTime;
    const uptimeSeconds = Math.floor(uptime / 1000);
    
    // Calculate rates
    const cacheHitRate = this.metrics.cache.hits + this.metrics.cache.misses > 0
      ? (this.metrics.cache.hits / (this.metrics.cache.hits + this.metrics.cache.misses) * 100).toFixed(2)
      : 0;

    const errorRate = this.metrics.requests.total > 0
      ? (this.metrics.requests.errors / this.metrics.requests.total * 100).toFixed(2)
      : 0;

    const avgQueryTime = this.metrics.database.queries > 0
      ? (this.metrics.database.totalDuration / this.metrics.database.queries).toFixed(2)
      : 0;

    return {
      uptime: {
        milliseconds: uptime,
        seconds: uptimeSeconds,
        formatted: this.formatUptime(uptimeSeconds)
      },
      requests: {
        ...this.metrics.requests,
        errorRate: `${errorRate}%`,
        requestsPerSecond: (this.metrics.requests.total / uptimeSeconds).toFixed(2)
      },
      database: {
        ...this.metrics.database,
        avgQueryTime: `${avgQueryTime}ms`,
        slowQueryPercentage: this.metrics.database.queries > 0
          ? ((this.metrics.database.slowQueries / this.metrics.database.queries) * 100).toFixed(2) + '%'
          : '0%'
      },
      cache: {
        ...this.metrics.cache,
        hitRate: `${cacheHitRate}%`,
        total: this.metrics.cache.hits + this.metrics.cache.misses
      },
      auth: this.metrics.auth,
      business: this.metrics.business,
      timestamp: new Date().toISOString()
    };
  }

  // ============================================
  // UTILITIES
  // ============================================
  
  formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m ${secs}s`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }

  reset() {
    this.metrics = {
      requests: { total: 0, success: 0, errors: 0, byMethod: {}, byEndpoint: {}, byStatusCode: {} },
      database: { queries: 0, slowQueries: 0, errors: 0, totalDuration: 0 },
      cache: { hits: 0, misses: 0, errors: 0 },
      auth: { logins: 0, signups: 0, failures: 0 },
      business: { connectionsSent: 0, connectionsAccepted: 0, connectionsRejected: 0, messagesExchanged: 0 }
    };
    this.startTime = Date.now();
    logger.info('Metrics reset');
  }

  logMetrics() {
    const metrics = this.getMetrics();
    
    logger.info('📊 Application Metrics', {
      uptime: metrics.uptime.formatted,
      requests: {
        total: metrics.requests.total,
        errorRate: metrics.errorRate,
        rps: metrics.requests.requestsPerSecond
      },
      database: {
        queries: metrics.database.queries,
        slowQueries: metrics.database.slowQueries,
        avgTime: metrics.database.avgQueryTime
      },
      cache: {
        hitRate: metrics.cache.hitRate
      }
    });
  }

  setupPeriodicLogging() {
    // Log metrics every 5 minutes
    setInterval(() => {
      this.logMetrics();
    }, 5 * 60 * 1000);
  }
}

// Create singleton instance
const metricsCollector = new MetricsCollector();

module.exports = metricsCollector;