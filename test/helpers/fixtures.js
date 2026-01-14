// test/helpers/fixtures.js
const User = require('../../src/model/userSchema');
const ConnectionRequest = require('../../src/model/connectionRequest');

class TestFixtures {
  /**
   * Create a test user
   * @param {Object} overrides - Override default values
   */
  static async createUser(overrides = {}) {
    const defaultUser = {
      firstName: 'Test',
      lastName: 'User',
      email: `test${Date.now()}@example.com`,
      password: 'Test@1234',
      age: 25,
      gender: 'male',
      skills: ['JavaScript', 'Node.js']
    };

    const user = new User({ ...defaultUser, ...overrides });
    await user.save();
    return user;
  }

  /**
   * Create multiple users
   * @param {Number} count 
   */
  static async createUsers(count) {
    const users = [];
    for (let i = 0; i < count; i++) {
      users.push(await this.createUser({
        firstName: `User${i}`,
        email: `user${i}@test.com`
      }));
    }
    return users;
  }

  /**
   * Create a connection request
   * @param {Object} fromUser 
   * @param {Object} toUser 
   * @param {String} status 
   */
  static async createConnection(fromUser, toUser, status = 'interested') {
    const connection = new ConnectionRequest({
      fromUserId: fromUser._id,
      toUserId: toUser._id,
      status
    });
    await connection.save();
    return connection;
  }

  /**
   * Generate auth token for user
   * @param {Object} user 
   */
  static generateAuthToken(user) {
    return user.getJWT();
  }

  /**
   * Create user with token
   */
  static async createUserWithToken(overrides = {}) {
    const user = await this.createUser(overrides);
    const token = this.generateAuthToken(user);
    return { user, token };
  }
}

module.exports = TestFixtures;