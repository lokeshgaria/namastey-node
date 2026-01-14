// ============================================
// File: src/core/repositories/UserRepository.js
// ============================================
const BaseRepository = require('./BaseRepository');

class UserRepository extends BaseRepository {
  constructor(UserModel) {
    super(UserModel);
    this.model = UserModel;
  }

  /**
   * Find user by email
   * @param {String} email 
   */
  async findByEmail(email) {
    return await this.model.findOne({ 
      email: email.toLowerCase() 
    });
  }

  /**
   * Find user by email with password (for login)
   * @param {String} email 
   */
  async findByEmailWithPassword(email) {
    return await this.model.findOne({ 
      email: email.toLowerCase() 
    }).select('+password'); // Include password field
  }

  /**
   * Find users excluding certain IDs
   * Used for feed generation
   * @param {Array} excludeIds 
   * @param {Object} options 
   */
  async findExcludingIds(excludeIds, options = {}) {
    const { skip = 0, limit = 10, select = null } = options;
    
    const query = this.model.find({
      _id: { $nin: excludeIds }
    });

    if (select) {
      query.select(select);
    }

    return await query
      .skip(skip)
      .limit(limit);
  }

  /**
   * Update user profile
   * @param {String} userId 
   * @param {Object} updateData 
   */
  async updateProfile(userId, updateData) {
    // Remove fields that shouldn't be updated
    const { password, email, _id, ...safeData } = updateData;

    return await this.model.findByIdAndUpdate(
      userId,
      safeData,
      { new: true, runValidators: true }
    );
  }

  /**
   * Check if email exists
   * @param {String} email 
   */
  async emailExists(email) {
    return await this.exists({ email: email.toLowerCase() });
  }

  /**
   * Get user with safe fields only
   * @param {String} userId 
   */
  async findByIdSafe(userId) {
    return await this.model
      .findById(userId)
      .select('firstName lastName age photoUrl skills about email');
  }

  /**
   * Find multiple users by IDs
   * @param {Array} userIds 
   */
  async findByIds(userIds) {
    return await this.model
      .find({ _id: { $in: userIds } })
      .select('firstName lastName age photoUrl skills about');
  }
}

module.exports = UserRepository;