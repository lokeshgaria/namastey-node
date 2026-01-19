const redis = require('redis');

class RedisClient {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      this.client = redis.createClient({
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD
      });

      this.client.on('connect', () => {
        console.log('✅ Redis connected');
        this.isConnected = true;
      });

      this.client.on('error', (err) => {
        console.error('❌ Redis error:', err);
        this.isConnected = false;
      });

      await this.client.connect();
    } catch (error) {
      console.error('Redis connection failed:', error);
    }
  }

  async get(key) {
    if (!this.isConnected) return null;
    try {
      return await this.client.get(key);
    } catch (error) {
      console.error(`Redis GET error for ${key}:`, error);
      return null;
    }
  }

  async set(key, value, expiryInSeconds = 3600) {
    if (!this.isConnected) return false;
    try {
      await this.client.set(key, value);
      if (expiryInSeconds) {
        await this.client.expire(key, expiryInSeconds);
      }
      return true;
    } catch (error) {
      console.error(`Redis SET error for ${key}:`, error);
      return false;
    }
  }

  async del(key) {
    if (!this.isConnected) return false;
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error(`Redis DEL error for ${key}:`, error);
      return false;
    }
  }
}

const redisClient = new RedisClient();
// redisClient.connect();

module.exports = redisClient;