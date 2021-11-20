const errors = require('common-errors');
const debug = require('debug')('app:error');

/**
 * Is base error
 * @param {Error} err 
 * @returns {Boolean}
 */
const isError = (err) => {
  return typeof err === 'object' && err instanceof Error;
}

/**
 * Is JSON object error
 * @param {Object} err 
 * @returns {Boolean}
 */
const isObjectError = (err) => {
  return typeof err === 'object' && !(err instanceof Error);
};

/**
 * Is database query error
 * @param {Error} err 
 * @returns {Boolean}
 */
const isDatabaseQueryError = (err) => {
  return isError(err) && err.hasOwnProperty('severity') && err.hasOwnProperty('schema') && err.hasOwnProperty('table')
};

/**
 * Is database client error
 * @param {Error} err 
 * @returns {Boolean}
 */
const isDatabaseClientError = (err) => {
  return isError(err) && err instanceof Error && err.message.startsWith('Knex: ');
};

/**
 * Is database error
 * @param {Error} err 
 * @returns {Boolean}
 */
const isDatabaseError = (err) => {
  return isDatabaseClientError(err) || isDatabaseQueryError(err);
}

const isRequestError = (err) => {
  return isObjectError(err) && err.code === 'invalid';
};

const isValidationError = (err) => {
  return isObjectError(err) && err.code === 'validation';
};

const isHttpStatusError = (err) => {
  return isError(err) && err instanceof errors.HttpStatusError;
};

/**
 * Default error handler
 * @param {Error} err 
 * @param {Express.Request} req 
 * @param {Express.Response} res 
 * @param {Function} next 
 */
function defaultErrorHandler (err, req, res, next) {
  debug(`Unhandled error "${err.message || err.toString()}"`);

  var responseStatus = 500;
  var responseHeaders = {};
  var responseError = {
    code: 'unexpected',
    message: 'An unexpected error occured',
    transient: true,
    requestId: req.id,
    _class: (isError(err) && err.name) || 'unknown'
  };

  if (!res.writableEnded) {
    if (isDatabaseError(err)) {
      responseError = {
        ...responseError,
        code: 'database_err',
        message: 'Unexpected database error',
        transient: isDatabaseClientError(err)
      };
    }

    if (isValidationError(err)) {
      responseStatus = 400;
      responseError = {
        ...responseError,
        code: 'validation',
        message: 'Validation failed',
        transient: false,
        validationErrors: [
          {
            in: 'requestBody',
            name: "attribute",
            error: 'missing'
          }
        ]
      };
    }

    if (isHttpStatusError(err)) {
      responseStatus = err.status_code;

      if (err.status_code === 404) {
        responseError.code = 'not_found';
        responseError.message = 'Resource was not found'
      }
    }

    /*
    res.status(500).json({
      error: {
        code: 'unexpected',
        message: 'An unexpected error occured',
        transient: true,
        requestId: req.id,
        isError: isError(err),
        isPostgresError: isPostgresError(err),
        isKnexError: isKnexError(err)
      }
    });
    */

    res.status(responseStatus).header(responseHeaders).json({ error: responseError });
  }
};

module.exports = defaultErrorHandler;