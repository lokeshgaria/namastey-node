class UserService {
  constructor(userRepository) {
    this.userRepo = userRepository;
  }

  getUser = async (req) => {
    try {
        const userId = req.user._id;
      const user = await this.userRepo.findByIdSafe(userId);
      if (!user) {
        throw new Error("User not found");
      }
      return user;
    } catch (error) {
      throw error;
    }
  };

  updateProfile = async (req) => {
    try {
      const userId = req.user._id;
      const updateData = req.body;
      const user = await this.userRepo.updateById(userId, updateData, { new: true });
      if (!user) {
        throw new Error("User not found");
      }
      return user;
    } catch (error) {
      throw error;
    }
  };

  getFeed = async (req) => {
    try {
      const userId = req.user._id;
      const feed = await this.userRepo.findExcludingIds(userId);
      return feed;
    } catch (error) {
      throw error;
    }
  };
 
}

module.exports = UserService;
