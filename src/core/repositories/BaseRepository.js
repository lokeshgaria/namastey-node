// ============================================
// File: src/core/repositories/BaseRepository.js
// ============================================
/**
 * Base Repository class with common CRUD operations
 * All other repositories extend this
 */
class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  /**
   * Find document by ID
   * @param {String} id 
   * @param {String} select - Fields to select
   */
  async findById(id, select = null) {
    const query = this.model.findById(id);
    if (select) {
      query.select(select);
    }
    return await query;
  }

  /**
   * Find one document by query
   * @param {Object} query 
   * @param {String} select 
   */
  async findOne(query, select = null) {
    const queryBuilder = this.model.findOne(query);
    if (select) {
      queryBuilder.select(select);
    }
    return await queryBuilder;
  }

  /**
   * Find all documents matching query
   * @param {Object} query 
   * @param {Object} options - { skip, limit, sort, select }
   */
  async find(query = {}, options = {}) {
    const { skip = 0, limit = 10, sort = {}, select = null } = options;
    
    const queryBuilder = this.model.find(query);
    
    if (select) {
      queryBuilder.select(select);
    }
    
    if (Object.keys(sort).length > 0) {
      queryBuilder.sort(sort);
    }
    
    return await queryBuilder
      .skip(skip)
      .limit(limit);
  }

  /**
   * Create a new document
   * @param {Object} data 
   */
  async create(data) {
    return await this.model.create(data);
  }

  /**
   * Update document by ID
   * @param {String} id 
   * @param {Object} data 
   * @param {Object} options 
   */
  async updateById(id, data, options = { new: true }) {
    return await this.model.findByIdAndUpdate(id, data, options);
  }

  /**
   * Update one document by query
   * @param {Object} query 
   * @param {Object} data 
   */
  async updateOne(query, data) {
    return await this.model.updateOne(query, data);
  }

  /**
   * Delete document by ID
   * @param {String} id 
   */
  async deleteById(id) {
    return await this.model.findByIdAndDelete(id);
  }

  /**
   * Delete one document by query
   * @param {Object} query 
   */
  async deleteOne(query) {
    return await this.model.deleteOne(query);
  }

  /**
   * Count documents matching query
   * @param {Object} query 
   */
  async count(query = {}) {
    return await this.model.countDocuments(query);
  }

  /**
   * Check if document exists
   * @param {Object} query 
   */
  async exists(query) {
    const count = await this.model.countDocuments(query);
    return count > 0;
  }
}

module.exports = BaseRepository;