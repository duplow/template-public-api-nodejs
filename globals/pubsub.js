
/**
 * Pubsub hooks
 */
module.exports = {

  /**
   * Subscribe a channel
   * @param {String} channel 
   * @param {Function} handler
   * @throws {InvalidOperationException}
   * @throws {ConnectionTimeoutException}
   * @returns {String} Subscription ID
   */
  subscribe: (channel, handler) => {
    // TODO: Code here
  },

  /**
   * Unsubscribe
   * @param {String} subscriptionId 
   * @throws {NotFoundException} Subscription not found
   */
  unsubscribe: (subscriptionId) => {
    // TODO: Code here
  },

  /**
   * Publish message to a channel
   * @param {String} channel 
   * @param {Object} message
   * @throws {InvalidOperationException}
   * @throws {ConnectionTimeoutException}
   */
  publish: async (channel, message) => {
    // TODO: Code here
  }
}