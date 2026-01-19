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
}

module.exports = UserController;
