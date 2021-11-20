const redis = require('redis');

/**
 * Create redis client
 * @param {Object} options 
 * @returns {Redis}
 */
const createRedis = (options = {}) => {
  var redisConnection = {
    //host: options.host || 'localhost',
    //port: options.port || 6379,
    //path: options.path || null,
    //url: options.url || null,
    //user: options.user || null,
    //password: options.password || null
    // retry_strategy
  };

  return redis.createClient(redisConnection);
};

module.exports = createRedis;