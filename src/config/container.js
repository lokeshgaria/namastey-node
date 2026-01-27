const ConnectionRepository = require("../core/repositories/ConnectionRepository");
const UserRepository = require("../core/repositories/UserRepository");
const ConnectionService = require("../core/services/ConnectionService");
const ConnectionController = require("../api/controllers/ConnectionController");
const AuthController = require("../api/controllers/AuthController");
const AuthService = require("../core/services/AuthService");
const UserService = require("../core/services/UserService");
const UserController = require("../api/controllers/UserController");
const FeedService = require("../core/services/Feedservice");
const FeedController = require("../api/controllers/FeedController");
const ChatService = require("../core/services/ChatService");
const ChatController = require("../api/controllers/ChatController");
const ChatRepository = require("../core/repositories/ChatRepostory");
const OrderRepository = require("../core/repositories/OrderRepository");
const OrderController = require("../api/controllers/OrderController");
 const OrderService = require("../core/services/OrderService");

 // caching service
 const CacheService = require("../infrastructure/cache/CacheService");
 const RedisClient = require("../infrastructure/cache/redis");
 
 

class Container {
  constructor() {
    this.services = {};
  }

  register(name, definition) {
    this.services[name] = definition;
  }

  get(name) {
    const service = this.services[name];
    if (!service) {
      throw new Error(`Service '${name}' not found in container`);
    }
    return typeof service === "function" ? service() : service;
  }
}

/**
 * Setup dependency injection container
 * @param {Object} models - Mongoose models { User, ConnectionRequest }
 */
function setupContainer(models) {
  const container = new Container();


  // ============================================
  // CACHE
  // ============================================
  const cacheService = new CacheService(RedisClient);
  container.register('cacheService', () => cacheService);

  // ============================================
  // REPOSITORIES
  // ============================================
  container.register(
    "connectionRepository",
    () => new ConnectionRepository(models.ConnectionRequest)
  );

  container.register("userRepository", () => new UserRepository(models.User));
  container.register("chatRepository", () => new ChatRepository(models.Chat));
  container.register("orderRepository", () => new OrderRepository(models.Order));


 
  // ============================================
  // SERVICES
  // ============================================

  // ============================================
  // SERVICES (with cache)
  // ============================================
  container.register(
    "connectionService",
    () =>
      new ConnectionService(
        container.get("connectionRepository"),
        container.get("userRepository"),
        cacheService  // ← Inject cache
      )
  );
  container.register(
    "authService",
    () => new AuthService(container.get("userRepository"))
  );
  container.register(
    "userService",
    () => new UserService(container.get("userRepository"),cacheService)
  );
  container.register(
    "feedService",
    () => new FeedService(container.get("connectionRepository"), container.get("userRepository"),cacheService)
  );

  container.register(
    "chatService",
    () => new ChatService(container.get("chatRepository"),cacheService)
  );

  container.register(
    "orderService",
    () => new OrderService(container.get("orderRepository"), container.get("userRepository"))
  );


  // ============================================
  // CONTROLLERS
  // ============================================
  container.register(
    "connectionController",
    () => new ConnectionController(container.get("connectionService"))
  );
  container.register(
    "authController",
    () => new AuthController(container.get("authService"))
  );
  container.register(
    "userController",
    () => new UserController(container.get("userService"))
  );

  container.register(
    "feedController",
    () => new FeedController(container.get("feedService"))
  );
  container.register(
    "chatController",
    () => new ChatController(container.get("chatService"))
  );

  container.register(
    "orderController",
    () => new OrderController(container.get("orderService"))
  );

  return container;
}

module.exports = { Container, setupContainer };
