
/**
 * Caching hooks
 */
module.exports = {

  /**
   * Set value
   * @param {String} key 
   * @param {Mixed} value 
   * @param {Object} options 
   * @param {Number} options.ttl
   */
  set: async (key, value, options = {}) => {
    // TODO: Code here
  },

  /**
   * Get value
   * @param {String} key
   * @returns {Promise<mixed>} Stored content or null if not found
   */
  get: async (key) => {
    // TODO: Code here
  },

  /**
   * Expire / delete value
   * @param {String} key 
   */
  expire: async (key) => {
    // TODO: Code here
  },

  /**
   * Set expiration / renew
   * @param {String} key
   * @param {Number} ttl Expiration in milliseconds
   */
  setExpiration: async (key, ttl) => {
    // TODO: Code here
  }
};