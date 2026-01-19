const BaseRepository = require('./BaseRepository');

class ConnectionRepository extends BaseRepository {
  constructor(ConnectionModel) {
    super(ConnectionModel);
    this.model = ConnectionModel;
  }

  /**
   * Find connection between two users (bidirectional)
   * @param {String} userId1 
   * @param {String} userId2 
   */
  async findByUsers(userId1, userId2) {
    return await this.model.findOne({
      $or: [
        { fromUserId: userId1, toUserId: userId2 },
        { fromUserId: userId2, toUserId: userId1 }
      ]
    });
  }

  /**
   * Get pending connection requests for a user
   * @param {String} userId 
   */
  async findPendingRequestsForUser(userId) {
    return await this.model
      .find({ 
        toUserId: userId, 
        status: 'interested' 
      })
      .populate('fromUserId', 'firstName lastName photoUrl age skills about');
  }

  /**
   * Get all accepted connections for a user
   * @param {String} userId 
   */
  async findUserConnections(userId) {
    return await this.model
      .find({
        $or: [
          { fromUserId: userId },
          { toUserId: userId }
        ],
        status: 'accepted'
       })
      .populate('fromUserId toUserId', 'firstName lastName photoUrl age skills about');
  }

  /**
   * Get all connections (any status) for a user
   * Used to exclude from feed
   * @param {String} userId 
   */
  async findAllConnectionsForUser(userId) {
    return await this.model.find({
      $or: [
        { fromUserId: userId },
        { toUserId: userId }
      ]
    }).select('fromUserId toUserId');
  }

  /**
   * Update connection status
   * @param {String} requestId 
   * @param {String} status 
   */
  async updateStatus(requestId, status) {
    return await this.model.findByIdAndUpdate(
      requestId,
      { status },
      { new: true }
    ).populate('fromUserId toUserId', 'firstName lastName photoUrl age skills about');
  }

  /**
   * Create new connection request
   * @param {Object} data - { fromUserId, toUserId, status }
   */
  async create(data) {
    const connection = new this.model(data);
    return await connection.save();
  }

  /**
   * Find connection by ID with populated fields
   * @param {String} id 
   */
  async findByIdPopulated(id) {
    return await this.model
      .findById(id)
      .populate('fromUserId toUserId', 'firstName lastName photoUrl age skills about');
  }
}

module.exports = ConnectionRepository;