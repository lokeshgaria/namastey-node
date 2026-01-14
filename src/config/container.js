const ConnectionRepository = require('../core/repositories/ConnectionRepository');
const UserRepository = require('../core/repositories/UserRepository');
const ConnectionService = require('../core/services/ConnectionService');
const ConnectionController = require('../api/controllers/ConnectionController');

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
    return typeof service === 'function' ? service() : service;
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
  container.register('connectionRepository', () => 
    new ConnectionRepository(models.ConnectionRequest)
  );
  
  container.register('userRepository', () => 
    new UserRepository(models.User)
  );

  // ============================================
  // SERVICES
  // ============================================
  container.register('connectionService', () => 
    new ConnectionService(
      container.get('connectionRepository'),
      container.get('userRepository')
    )
  );

  // ============================================
  // CONTROLLERS
  // ============================================
  container.register('connectionController', () => 
    new ConnectionController(
      container.get('connectionService')
    )
  );

  return container;
}

module.exports = { Container, setupContainer };