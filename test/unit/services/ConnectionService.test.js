const ConnectionService = require('../../../src/core/services/ConnectionService');

describe('ConnectionService - Unit Tests', () => {
  let connectionService;
  let mockConnectionRepo;
  let mockUserRepo;

  beforeEach(() => {
    // Create mock repositories
    mockConnectionRepo = {
      create: jest.fn(),
      findByUsers: jest.fn(),
      findById: jest.fn(),
      updateStatus: jest.fn(),
    };

    mockUserRepo = {
      findById: jest.fn(),
    };

    // Create service with mocks
    connectionService = new ConnectionService(
      mockConnectionRepo,
      mockUserRepo
    );
  });

  describe('sendConnectionRequest', () => {
    it('should throw error when sending to self', async () => {
      await expect(
        connectionService.sendConnectionRequest('user1', 'user1', 'interested')
      ).rejects.toThrow('Cannot send connection request to yourself');
    });

    it('should throw error when user not found', async () => {
      mockUserRepo.findById.mockResolvedValue(null);

      await expect(
        connectionService.sendConnectionRequest('user1', 'user2', 'interested')
      ).rejects.toThrow('User not found');
    });

    it('should throw error for invalid status', async () => {
      mockUserRepo.findById.mockResolvedValue({ _id: 'user2' });
      mockConnectionRepo.findByUsers.mockResolvedValue(null);

      await expect(
        connectionService.sendConnectionRequest('user1', 'user2', 'invalid')
      ).rejects.toThrow('Invalid status');
    });

    it('should create connection successfully', async () => {
      const mockUser = { _id: 'user2', firstName: 'Bob' };
      const mockConnection = { 
        _id: 'conn1',
        fromUserId: 'user1',
        toUserId: 'user2',
        status: 'interested'
      };

      mockUserRepo.findById.mockResolvedValue(mockUser);
      mockConnectionRepo.findByUsers.mockResolvedValue(null);
      mockConnectionRepo.create.mockResolvedValue(mockConnection);

      const result = await connectionService.sendConnectionRequest(
        'user1',
        'user2',
        'interested'
      );

      expect(result).toEqual(mockConnection);
      expect(mockConnectionRepo.create).toHaveBeenCalledWith({
        fromUserId: 'user1',
        toUserId: 'user2',
        status: 'interested'
      });
    });
  });
});