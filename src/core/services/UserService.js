class UserService {
  constructor(userRepository, cacheService) {
    this.userRepo = userRepository;
    this.cache = cacheService;
  }

  // getUser = async (req) => {
  //   try {
  //       const userId = req.user._id;
  //     const user = await this.userRepo.findByIdSafe(userId);
  //     if (!user) {
  //       throw new Error("User not found");
  //     }
  //     return user;
  //   } catch (error) {
  //     throw error;
  //   }
  // };

    /**
   * Get user profile (with caching)
   */
    getUser = async (req) => {
      const userId = req.user._id;
      return await this.cache.getUserProfile(
        userId,
        async () => {
          // Fetch from database if not in cache
          const user = await this.userRepo.findByIdSafe(userId);
          if (!user) {
            throw new Error('User not found');
          }
          return user.toObject();
        }
      );
    }

    

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
