const redis = require('redis');

class RedisClient {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
  }

  async connect() {
    try {
      // Create Redis client
      this.client = redis.createClient({
        socket: {
          host: process.env.REDIS_HOST || 'localhost',
          port: process.env.REDIS_PORT || 6379,
          reconnectStrategy: (retries) => {
            this.reconnectAttempts = retries;
            
            // Stop reconnecting after max attempts
            if (retries > this.maxReconnectAttempts) {
              console.error('❌ Redis: Max reconnection attempts reached');
              return new Error('Redis connection failed');
            }
            
            // Exponential backoff: 50ms, 100ms, 200ms, 400ms...
            const delay = Math.min(retries * 50, 3000);
            console.log(`🔄 Redis reconnecting in ${delay}ms (attempt ${retries})`);
            return delay;
          }
        },
        password: process.env.REDIS_PASSWORD || undefined
      });

      // Event: Successful connection
      this.client.on('connect', () => {
        console.log('🔌 Redis connecting...');
      });

      this.client.on('ready', () => {
        console.log('✅ Redis connected and ready');
        this.isConnected = true;
        this.reconnectAttempts = 0;
      });

      // Event: Error occurred
      this.client.on('error', (err) => {
        console.error('❌ Redis error:', err.message);
        this.isConnected = false;
      });

      // Event: Connection closed
      this.client.on('end', () => {
        console.log('⚠️  Redis connection closed');
        this.isConnected = false;
      });

      // Event: Reconnecting
      this.client.on('reconnecting', () => {
        console.log('🔄 Redis reconnecting...');
      });

      // Connect to Redis
      await this.client.connect();
      
    } catch (error) {
      console.error('❌ Failed to connect to Redis:', error.message);
      console.log('⚠️  App will continue without caching');
      this.isConnected = false;
    }
  }

  /**
   * Get value from Redis
   * @param {String} key 
   */
  async get(key) {
    if (!this.isConnected) {
      console.warn('⚠️  Redis not connected, returning null');
      return null;
    }

    try {
      const value = await this.client.get(key);
      return value;
    } catch (error) {
      console.error(`❌ Redis GET error for key "${key}":`, error.message);
      return null;
    }
  }

  /**
   * Set value in Redis with optional expiry
   * @param {String} key 
   * @param {String} value 
   * @param {Number} expiryInSeconds 
   */
  async set(key, value, expiryInSeconds = 3600) {
    if (!this.isConnected) {
      console.warn('⚠️  Redis not connected, skipping cache set');
      return false;
    }

    try {
      if (expiryInSeconds) {
        await this.client.setEx(key, expiryInSeconds, value);
      } else {
        await this.client.set(key, value);
      }
      return true;
    } catch (error) {
      console.error(`❌ Redis SET error for key "${key}":`, error.message);
      return false;
    }
  }

  /**
   * Delete key from Redis
   * @param {String} key 
   */
  async del(key) {
    if (!this.isConnected) {
      console.warn('⚠️  Redis not connected, skipping cache delete');
      return false;
    }

    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error(`❌ Redis DEL error for key "${key}":`, error.message);
      return false;
    }
  }

  /**
   * Delete multiple keys matching pattern
   * @param {String} pattern - e.g., "user:123:*"
   */
  async delPattern(pattern) {
    if (!this.isConnected) return false;

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
        console.log(`🗑️  Deleted ${keys.length} keys matching "${pattern}"`);
      }
      return true;
    } catch (error) {
      console.error(`❌ Redis DEL PATTERN error for "${pattern}":`, error.message);
      return false;
    }
  }

  /**
   * Check if key exists
   * @param {String} key 
   */
  async exists(key) {
    if (!this.isConnected) return false;

    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`❌ Redis EXISTS error for key "${key}":`, error.message);
      return false;
    }
  }

  /**
   * Get remaining TTL for a key
   * @param {String} key 
   */
  async ttl(key) {
    if (!this.isConnected) return -1;

    try {
      return await this.client.ttl(key);
    } catch (error) {
      console.error(`❌ Redis TTL error for key "${key}":`, error.message);
      return -1;
    }
  }

  /**
   * Gracefully disconnect
   */
  async disconnect() {
    if (this.client) {
      await this.client.quit();
      console.log('👋 Redis disconnected');
    }
  }

  /**
   * Get Redis info
   */
  async getInfo() {
    if (!this.isConnected) return null;

    try {
      const info = await this.client.info();
      return info;
    } catch (error) {
      console.error('❌ Redis INFO error:', error.message);
      return null;
    }
  }
}

// Create singleton instance
const redisClient = new RedisClient();

module.exports = redisClient;