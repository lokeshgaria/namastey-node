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
  // REPOSITORIES
  // ============================================
  container.register(
    "connectionRepository",
    () => new ConnectionRepository(models.ConnectionRequest)
  );

  container.register("userRepository", () => new UserRepository(models.User));
  container.register("chatRepository", () => new ChatRepository(models.Chat));
  // ============================================
  // SERVICES
  // ============================================
  container.register(
    "connectionService",
    () =>
      new ConnectionService(
        container.get("connectionRepository"),
        container.get("userRepository")
      )
  );
  container.register(
    "authService",
    () => new AuthService(container.get("userRepository"))
  );
  container.register(
    "userService",
    () => new UserService(container.get("userRepository"))
  );
  container.register(
    "feedService",
    () => new FeedService(container.get("connectionRepository"), container.get("userRepository"))
  );

  container.register(
    "chatService",
    () => new ChatService(container.get("chatRepository"))
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

  return container;
}

module.exports = { Container, setupContainer };
