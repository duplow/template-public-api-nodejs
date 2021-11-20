
/**
 * Status
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
 module.exports = function (req, res) {
  res.json({
    status: 'online'
  });
};
