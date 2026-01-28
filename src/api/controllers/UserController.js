class UserController {
  constructor(userService) {
    this.userService = userService;
    
  }

  getUser = async (req, res, next) => {
    try {
      const user = await this.userService.getUser(req);
      res.status(200).json({
        success: true,
        message: `User fetched successfully`,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req, res, next) => {
    try {
      const updatedUser = await this.userService.updateProfile(req);
      res.status(200).json({
        success: true,
        message: `User profile updated successfully`,
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /feed
  getFeed = async (req, res, next) => {
    try {
      const userId = req.user._id;
      const page = parseInt(req.query.page) || 1;
      const limit = Math.min(parseInt(req.query.limit) || 10, 50);
      
      const feed = await this.feedService.getFeed(userId, page, limit);
      
      res.json({ success: true, data: feed });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = UserController;
