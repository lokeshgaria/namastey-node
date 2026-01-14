class ConnectionService {
  constructor(connectionRepository, userRepository) {
    this.connectionRepo = connectionRepository;
    this.userRepo = userRepository;
  }

  /**
   * Send a connection request (swipe right/left)
   * @param {String} fromUserId 
   * @param {String} toUserId 
   * @param {String} status - 'interested' or 'ignored'
   */
  async sendConnectionRequest(fromUserId, toUserId, status) {
    // Business Rule 1: Cannot send request to yourself
    if (fromUserId.toString() === toUserId.toString()) {
      throw new Error("Cannot send connection request to yourself");
    }

    // Business Rule 2: Status must be valid
    const allowedStatuses = ['interested', 'ignored'];
    if (!allowedStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${allowedStatuses.join(', ')}`);
    }

    // Business Rule 3: Target user must exist
    const toUser = await this.userRepo.findById(toUserId);
    if (!toUser) {
      throw new Error("User not found");
    }

    // Business Rule 4: No duplicate connections
    const existingConnection = await this.connectionRepo.findByUsers(
      fromUserId,
      toUserId
    );

    if (existingConnection) {
      throw new Error(`Connection request already exists with status: ${existingConnection.status}`);
    }

    // Create the connection
    const connection = await this.connectionRepo.create({
      fromUserId,
      toUserId,
      status
    });

    return connection;
  }

  /**
   * Review a connection request (accept/reject)
   * @param {String} requestId 
   * @param {String} reviewerId - User reviewing the request
   * @param {String} status - 'accepted' or 'rejected'
   */
  async reviewConnectionRequest(requestId, reviewerId, status) {
    // Business Rule 1: Valid status
    const allowedStatuses = ['accepted', 'rejected'];
    if (!allowedStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${allowedStatuses.join(', ')}`);
    }

    // Find the request
    const request = await this.connectionRepo.findById(requestId);
    if (!request) {
      throw new Error("Connection request not found");
    }

    // Business Rule 2: Only recipient can review
    if (request.toUserId.toString() !== reviewerId.toString()) {
      throw new Error("You are not authorized to review this request");
    }

    // Business Rule 3: Can only review 'interested' requests
    if (request.status !== 'interested') {
      throw new Error("Can only review requests with 'interested' status");
    }

    // Update the status
    const updatedRequest = await this.connectionRepo.updateStatus(
      requestId,
      status
    );

    return updatedRequest;
  }

  /**
   * Get all pending requests received by a user
   * @param {String} userId 
   */
  async getPendingRequests(userId) {
    const requests = await this.connectionRepo.findPendingRequestsForUser(userId);
    return requests;
  }

  /**
   * Get all accepted connections for a user
   * @param {String} userId 
   */
  async getUserConnections(userId) {
    const connections = await this.connectionRepo.findUserConnections(userId);

    // Transform the data to return just the connected user
    const connectedUsers = connections.map(connection => {
      // If current user is the sender, return receiver; otherwise return sender
      const isFromUser = connection.fromUserId._id.toString() === userId.toString();
      return isFromUser ? connection.toUserId : connection.fromUserId;
    });

    return connectedUsers;
  }

  /**
   * Get all connection IDs for a user (for feed filtering)
   * @param {String} userId 
   */
  async getAllConnectionIds(userId) {
    const connections = await this.connectionRepo.findAllConnectionsForUser(userId);
    
    const connectionIds = new Set();
    connectionIds.add(userId.toString()); // Add self
    
    connections.forEach(conn => {
      connectionIds.add(conn.fromUserId.toString());
      connectionIds.add(conn.toUserId.toString());
    });

    return Array.from(connectionIds);
  }
}

module.exports = ConnectionService;