const request = require('supertest');
const app = require('../../src/app');
const TestFixtures = require('../helpers/fixtures');

describe('Connection API - Integration Tests', () => {
  let user1, user2, token1, token2;

  beforeEach(async () => {
    // Create test users with tokens
    const result1 = await TestFixtures.createUserWithToken({ 
      email: 'alice@test.com' 
    });
    const result2 = await TestFixtures.createUserWithToken({ 
      email: 'bob@test.com' 
    });

    user1 = result1.user;
    token1 = result1.token;
    user2 = result2.user;
    token2 = result2.token;
  });

  describe('POST /api/v2/request/send/:status/:toUserId', () => {
    it('should send connection request successfully', async () => {
      const response = await request(app)
        .post(`/api/v2/request/send/interested/${user2._id}`)
        .set('Cookie', [`token=${token1}`])
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('interested');
    });

    it('should fail when sending to self', async () => {
      const response = await request(app)
        .post(`/api/v2/request/send/interested/${user1._id}`)
        .set('Cookie', [`token=${token1}`])
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('yourself');
    });
  });
});