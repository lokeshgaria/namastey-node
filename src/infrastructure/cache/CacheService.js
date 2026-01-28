class CacheService {
    constructor(redisClient) {
      this.redis = redisClient;
      this.metrics = {
        hits: 0,
        misses: 0,
        sets: 0,
        deletes: 0
      };
    }
  
    // ============================================
    // CACHE KEY PATTERNS
    // ============================================
    keys = {
      // User keys
      userProfile: (userId) => `user:${userId}:profile`,
      userConnections: (userId) => `user:${userId}:connections`,
      userRequests: (userId) => `user:${userId}:requests`,
      
      // Feed keys
      feed: (userId, page) => `feed:${userId}:page:${page}`,
      feedAll: (userId) => `feed:${userId}:*`,
      
      // Connection keys
      connection: (connectionId) => `connection:${connectionId}`,
      
      // Session keys
      session: (token) => `session:${token}`,
      
      // Stats keys
      stats: (userId) => `stats:${userId}`,

      // chat keys
      chat:(userId, targetUserId) =>`chats:${userId}:to${targetUserId}`
    };
  
    // ============================================
    // TTL CONFIGURATIONS (in seconds)
    // ============================================
    ttl = {
      userProfile: 1800,        // 30 minutes
      userConnections: 300,     // 5 minutes (changes frequently)
      userRequests: 180,        // 3 minutes (changes frequently)
      feed: 600,                // 10 minutes
      connection: 3600,         // 1 hour
      session: 604800,          // 7 days
      stats: 86400,             // 24 hours
      chats:2000               //  4 mins
    };
  
    // ============================================
    // BASIC OPERATIONS WITH METRICS
    // ============================================
  
    async get(key) {
      const value = await this.redis.get(key);
      
      // Track metrics
      if (value) {
        this.metrics.hits++;
      } else {
        this.metrics.misses++;
      }
      
      return value;
    }
  
    async set(key, value, ttl) {
      this.metrics.sets++;
      return await this.redis.set(key, value, ttl);
    }
  
    async del(key) {
      this.metrics.deletes++;
      return await this.redis.del(key);
    }
  
    // ============================================
    // CACHE-ASIDE PATTERN
    // ============================================
  
    /**
     * Cache-aside pattern: Try cache, then fetch from source
     * @param {String} key 
     * @param {Function} fetchFunction - Async function to fetch data
     * @param {Number} ttl 
     */
    async cacheAside(key, fetchFunction, ttl = 3600) {
      // 1. Try to get from cache
      const cached = await this.get(key);
      
      if (cached) {
        console.log(`✅ Cache HIT: ${key}`);
        return JSON.parse(cached);
      }
  
      console.log(`❌ Cache MISS: ${key}`);
  
      // 2. Fetch from source (database)
      const data = await fetchFunction();
      
      // 3. Store in cache for next time
      if (data) {
        await this.set(key, JSON.stringify(data), ttl);
        console.log(`💾 Cached: ${key} (TTL: ${ttl}s)`);
      }
      
      return data;
    }
  
    // ============================================
    // USER PROFILE CACHING
    // ============================================
  
    async getUserProfile(userId, fetchFunction) {
      const key = this.keys.userProfile(userId);
      return await this.cacheAside(key, fetchFunction, this.ttl.userProfile);
    }
  
    async setUserProfile(userId, userData) {
      const key = this.keys.userProfile(userId);
      return await this.set(
        key, 
        JSON.stringify(userData), 
        this.ttl.userProfile
      );
    }
  
    async invalidateUserProfile(userId) {
      const key = this.keys.userProfile(userId);
      return await this.del(key);
    }
  
    // ============================================
    // USER CONNECTIONS CACHING
    // ============================================
  
    async getUserConnections(userId, fetchFunction) {
      const key = this.keys.userConnections(userId);
      return await this.cacheAside(key, fetchFunction, this.ttl.userConnections);
    }

    
  
    async invalidateUserConnections(userId) {
      const key = this.keys.userConnections(userId);
      return await this.del(key);
    }
  
    // ============================================
    // USER REQUESTS CACHING
    // ============================================
  
    async getUserRequests(userId, fetchFunction) {
      const key = this.keys.userRequests(userId);
      return await this.cacheAside(key, fetchFunction, this.ttl.userRequests);
    }
  
    async invalidateUserRequests(userId) {
      const key = this.keys.userRequests(userId);
      return await this.del(key);
    }
  
    // ============================================
    // FEED CACHING
    // ============================================
  
    async getFeed(userId, page, fetchFunction) {
      const key = this.keys.feed(userId, page);
      return await this.cacheAside(key, fetchFunction, this.ttl.feed);
    }
   
    async invalidateFeed(userId, maxPages = 10) {
      const promises = [];
      for (let page = 1; page <= maxPages; page++) {
        const key = this.keys.feed(userId, page);
        promises.push(this.del(key));
      }
      await Promise.all(promises);
      console.log(`🗑️  Invalidated ${maxPages} feed pages for user ${userId}`);
    }
    // ============================================
    // CHAT CHACHING 
    // ============================================
    async getChats(userId, targetUserId,fetchFunction){
    const key = this.keys.chat(userId,targetUserId)
    return await this.cacheAside(key,fetchFunction,this.ttl.chats)
    }
    // Alternative: Delete all feed pages using pattern
    async invalidateAllFeedPages(userId) {
      const pattern = this.keys.feedAll(userId);
      return await this.redis.delPattern(pattern);
    }
  
    // ============================================
    // INVALIDATION STRATEGIES
    // ============================================
  
    /**
     * Invalidate all user-related caches
     * Use when: User profile updated
     */
    async invalidateUserData(userId) {
      await Promise.all([
        this.invalidateUserProfile(userId),
        this.invalidateUserConnections(userId),
        this.invalidateUserRequests(userId),
        this.invalidateFeed(userId)
      ]);
      console.log(`🗑️  Invalidated all cache for user ${userId}`);
    }
  
    /**
     * Invalidate connection-related caches for two users
     * Use when: New connection made or request sent
     */
    async invalidateConnectionData(userId1, userId2) {
      await Promise.all([
        this.invalidateUserConnections(userId1),
        this.invalidateUserConnections(userId2),
        this.invalidateUserRequests(userId1),
        this.invalidateUserRequests(userId2),
        this.invalidateFeed(userId1),
        this.invalidateFeed(userId2)
      ]);
      console.log(`🗑️  Invalidated connection cache for ${userId1} and ${userId2}`);
    }
  
    // ============================================
    // METRICS & MONITORING
    // ============================================
  
    getMetrics() {
      const total = this.metrics.hits + this.metrics.misses;
      const hitRate = total > 0 ? (this.metrics.hits / total * 100).toFixed(2) : 0;
      
      return {
        hits: this.metrics.hits,
        misses: this.metrics.misses,
        total: total,
        hitRate: `${hitRate}%`,
        sets: this.metrics.sets,
        deletes: this.metrics.deletes
      };
    }
  
    resetMetrics() {
      this.metrics = {
        hits: 0,
        misses: 0,
        sets: 0,
        deletes: 0
      };
    }
  
    logMetrics() {
      const metrics = this.getMetrics();
      console.log('\n📊 Cache Metrics:');
      console.log(`   Hits: ${metrics.hits}`);
      console.log(`   Misses: ${metrics.misses}`);
      console.log(`   Hit Rate: ${metrics.hitRate}`);
      console.log(`   Sets: ${metrics.sets}`);
      console.log(`   Deletes: ${metrics.deletes}\n`);
    }
  }
  
  module.exports = CacheService;