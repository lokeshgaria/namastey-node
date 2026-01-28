class ConnectionController {
  constructor(connectionService) {
    this.connectionService = connectionService;
  }

  /**
   * POST /request/send/:status/:toUserId
   * Send a connection request (swipe)
   */
  sendRequest = async (req, res, next) => {
    try {

      console.log('inside connection controller')
      const { status, toUserId } = req.params;
      const fromUserId = req.user._id;

      const connection = await this.connectionService.sendConnectionRequest(
        fromUserId,
        toUserId,
        status
      );

      res.status(200).json({
        success: true,
        message: `Connection request ${status} sent successfully`,
        data: connection
      });
    } catch (error) {
      next(error); // Pass to error handling middleware
    }
  };

  /**
   * POST /request/review/:status/:requestId
   * Accept or reject a connection request
   */
  reviewRequest = async (req, res, next) => {
    try {
      const { status, requestId } = req.params;
      const reviewerId = req.user._id.toString();

      const updatedRequest = await this.connectionService.reviewConnectionRequest(
        requestId,
        reviewerId,
        status
      );

      res.status(200).json({
        success: true,
        message: `Connection request ${status} successfully`,
        data: updatedRequest
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /user/requests/received
   * Get all pending connection requests
   */
  getPendingRequests = async (req, res, next) => {
    try {
      const userId = req.user._id;

      const requests = await this.connectionService.getPendingChacheRequest(userId);

      res.status(200).json({
        success: true,
          data: requests,
          count: requests.length
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /user/connections
   * Get all accepted connections
   */
  getConnections = async (req, res, next) => {
    try {
      const userId = req.user._id.toString();

      const connections = await this.connectionService.getUserCacheConnection(userId);

      res.status(200).json({
        success: true,
        data: connections,
        count: connections.length
      });
    } catch (error) {
      next(error);
    }
  };
} 

module.exports = ConnectionController;