// Simplified feed.service.js
const { USER_SAFE_DATA, PAGINATION } = require("../../config/constants");
class FeedService {
    constructor(connectionRepo, userRepo, cacheService) {
        this.connectionRepo = connectionRepo;
        this.userRepo = userRepo;
        this.cache = cacheService
    }

    getFeed = async (userId, page, limit) => {
        try {

            limit = limit > PAGINATION.MAX_LIMIT ? PAGINATION.MAX_LIMIT : limit;
            const skip = (page - 1) * limit;

            // Get all connections (sent + received)
            const connections = await this.connectionRepo.findAllConnectionsForUser(userId);

            // Create set of users to exclude

            const hideUsersFromFeed = new Set();
            connections.forEach(request => {
                hideUsersFromFeed.add(request.fromUserId._id.toString());
                hideUsersFromFeed.add(request.toUserId._id.toString());
            });

            // connectionList.forEach((request) => {
            //     hideUsersFromFeed.add(request.fromUserId.toString());
            //     hideUsersFromFeed.add(request.toUserId.toString());
            //   });

            // Add current user to exclude list
            hideUsersFromFeed.add(userId.toString());

            // Get users for feed
            // console.log("hideUsersFromFeed v2", Array.from(hideUsersFromFeed), Array.from(hideUsersFromFeed).length);

            const users = await this.userRepo.findExcludingIds(
                Array.from(hideUsersFromFeed),
                {
                    page,
                    limit,
                    select: USER_SAFE_DATA
                }
            );
            //  console.log("usr_",users)
            return users;
        } catch (error) {
            throw error;
        }
    }

    getFeedChache = async (userId, page, limit) => {
        return await this.cache.getFeed(userId, page, async () => {
            const result = await this.getFeed(userId, page, limit);
            return result;
        });
    }
}

module.exports = FeedService;