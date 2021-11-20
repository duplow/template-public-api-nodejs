
/**
 * Pagination middleware
 * @param {Express.Request} req 
 * @param {Express.Response} res 
 * @param {Function} next 
 */
module.exports = function (req, res, next) {
  req.query.from // TODO: Sanitize int >= 0
  req.query.size // TODO: Sanitize int >= 1 or -1

  req.pagination = (defaultSize = 10, maxSize = 20) => {
    var size = defaultSize;

    if (req.query.size) {
      if (req.query.size > maxSize) {
        size = maxSize;
      } else {
        size = req.query.size;
      }
    }

    return {
      from: req.query.from,
      size: size
    };
  }
};