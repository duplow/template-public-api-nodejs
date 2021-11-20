const os = require('os');

/**
 * Display application stats
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @param {Function} next
 */
 module.exports = function (req, res, next) {
  try {
    res.json({
      pid: process.pid,
      memoryUsage: (process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100,
      os: {
        cpu: parseFloat(((process.cpuUsage().system / process.cpuUsage().user) * 100).toFixed(2)),
        memory: parseFloat((((os.totalmem() - os.freemem()) / os.totalmem()) * 100).toFixed(2))
      }
    });
  } catch (e) {
    next(e);
  }
};
