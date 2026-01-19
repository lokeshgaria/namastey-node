// feed.controller.js
const { PAGINATION } = require("../../config/constants");

class FeedController {
  constructor(feedService) {
    this.feedService = feedService;
  }

  getFeed = async (req, res, next) => {
    try {
      const userId = req.user._id;
      const page = parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE;
      const limit = Math.min(parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
      const feedData = await this.feedService.getFeed(userId, page, limit);
      
      res.status(200).json({
        success: true,
        message: 'Feed fetched successfully',
        data: feedData.sort((a, b) => a.firstName.localeCompare(b.firstName)),
        pagination: feedData.pagination,
        count: feedData.length
      });
    } catch (error) {
      next(error);
    }
  }

  getFilteredFeed = async (req, res, next) => {
    try {
      const feedData = await this.feedService.getFeedWithFilters(req);
      res.status(200).json({
        success: true,
        message: `Filtered feed fetched successfully`,
        data: feedData,
      });
    } catch (error) {
      next(error);
    }
  }

  getPersonalizedFeed = async (req, res, next) => {
    try {
      const feedData = await this.feedService.getPersonalizedFeed(req);
      
      res.status(200).json({
        success: true,
        message: 'Personalized feed fetched successfully',
        data: feedData.users,
        pagination: feedData.pagination,
        personalized: feedData.personalized
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = FeedController;