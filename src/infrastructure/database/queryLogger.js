//queryLogger.js

const logger = require('../logging/logger');
const metricsCollector = require('../monitoring/MetricsCollector');

/**
 * Setup MongoDB query logging
 */
function setupQueryLogging(mongoose) {
  // Enable debugging in development
  if (process.env.NODE_ENV === 'development') {
    mongoose.set('debug', (collectionName, method, query, doc) => {
      logger.debug('MongoDB Query', {
        collection: collectionName,
        method,
        query: JSON.stringify(query),
        doc: doc ? JSON.stringify(doc) : undefined
      });
    });
  }

  // Add plugin to all schemas for query timing
  mongoose.plugin((schema) => {
    // Before query
    schema.pre(/^find/, function() {
      this._startTime = Date.now();
    });

    schema.pre('save', function() {
      this._startTime = Date.now();
    });

    schema.pre(/^update/, function() {
      this._startTime = Date.now();
    });

    schema.pre(/^delete/, function() {
      this._startTime = Date.now();
    });

    // After query
    schema.post(/^find/, function(docs) {
      if (this._startTime) {
        const duration = Date.now() - this._startTime;
        const modelName = this.model ? this.model.modelName : 'Unknown';
        
        // Log slow queries
        logger.logDatabaseQuery('find', modelName, duration, {
          query: this.getQuery()
        });

        // Record metrics
        metricsCollector.recordDatabaseQuery(duration, modelName, 'find');
      }
    });

    schema.post('save', function(doc) {
      if (this._startTime) {
        const duration = Date.now() - this._startTime;
        const modelName = this.constructor.modelName;
        
        logger.logDatabaseQuery('save', modelName, duration);
        metricsCollector.recordDatabaseQuery(duration, modelName, 'save');
      }
    });

    schema.post(/^update/, function(result) {
      if (this._startTime) {
        const duration = Date.now() - this._startTime;
        const modelName = this.model ? this.model.modelName : 'Unknown';
        
        logger.logDatabaseQuery('update', modelName, duration);
        metricsCollector.recordDatabaseQuery(duration, modelName, 'update');
      }
    });

    schema.post(/^delete/, function(result) {
      if (this._startTime) {
        const duration = Date.now() - this._startTime;
        const modelName = this.model ? this.model.modelName : 'Unknown';
        
        logger.logDatabaseQuery('delete', modelName, duration);
        metricsCollector.recordDatabaseQuery(duration, modelName, 'delete');
      }
    });
  });

  logger.info('Database query logging enabled');
}

module.exports = setupQueryLogging;