
/**
 * Broker hooks
 */
module.exports = {

  /**
   * Send a message to a channel (enqueue)
   * @param {String} channel Topic
   * @param {Object} messageBody Message body
   * @param {Object} options
   * @param {Object} options.correlationId
   * @param {Object} options.deduplicationId
   * @throws {TimeoutException}
   */
  send: async (channel, messageBody, options = {}) => {
    // TODO: Code here
  },

  /**
   * Receive messages from a channel (dequeue)
   * @param {String} channel
   * @param {Number} maxItems Max returned messages
   * @throws {TimeoutException}
   */
  receive: async (channel, maxItems) => {
    // TODO: Code here
  },

  /**
   * Acknowledge or delete message
   * @param {Message} message
   * @throws {NotFoundException}
   */
  acknowledge: async (message) => {
    // TODO: Code here
  },

  /**
   * Receive messages from a channel (dequeue)
   * @param {String} channel
   * @param {Number} maxItems Max returned messages
   * @param {Number} timeoutMs Max waiting time
   */
  receiveWithPolling: async (channel, maxItems, timeoutMs = null) => {
    // TODO: Code here
  }
};