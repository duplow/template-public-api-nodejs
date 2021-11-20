/**
 * Resolve glob fields
 * @param {Object} schema 
 * @param {string} pattern 
 * @returns {Array} fields
 */
const resolveGlob = (schema, pattern) => {
  pattern = pattern.trim(); // TODO: Sanitize
  var buffer = null;
  
  if (pattern === '*') {
    return [ ...schema.fields ];
  }

  buffer = [];

  if (pattern.length > 0) {
    // TODO: Run globs
    return [ pattern ];
  }

  return buffer;
};

/**
 * Resolve fields callback
 * @param {Object} schema
 * @param {Array} schema.fields Available fields
 * @param {Array} schema.defaults Default fields
 * @param {Express.Request} req Request
 * @param {Object} middlewareOptions Options of middleware 
 * @returns {Array} Resolved fields
 */
const resolveFieldsFn = (schema, req) => {
  var buffer = [ ...schema.defaults ];
  //var boundary = `-boundary---${(Math.random() * 8999) + 1000}`;

  if (req.query.includeFields && req.query.includeFields.toString().trim().length > 0) {
    req.query.includeFields
      .toString()
      .trim()
      .split(',')
      .map((pattern) => pattern.trim())
      .forEach((pattern) => {
        resolveGlob(schema, pattern)
          .forEach((name) => {
            if (buffer.indexOf(name) === -1) {
              buffer.push(name);
            }
          });
      });
  }

  if (req.query.excludeFields && req.query.excludeFields.toString().trim().length > 0) {
    req.query.excludeFields
      .toString()
      .trim()
      .split(',')
      .map((pattern) => pattern.trim())
      .forEach((pattern) => {
        resolveGlob(schema, pattern)        
          .forEach((name) => {
            if (buffer.indexOf(name) !== -1) {
              buffer.splice(buffer.indexOf(name), 1);
            }
          });
      });
  }

  // TODO: Add support negative form (Ex: *,!field3)
  // TODO: Add support to accumulative globs

  /*
  if (req.query.fields && Array.isArray(req.query.fields.split(','))) {
    buffer = [];    

    req.query.fields
      .replace('\\,', boundary)
      .split(',')
      .map((pattern) => pattern.trim().replace(boundary, ','))
      .forEach((pattern) => {
        resolveGlob(schema, pattern)
          .forEach((name) => {
            if (buffer.indexOf(name) === -1) {
              buffer.push(name);
            }
          });
      });
  }
  */

  return buffer;
};

const DEFAULT_OPTIONS = {
  unknowFields: false, // Strict mode
  glob: true
};

/**
 * Resolve fields middleware
 * @param {Object} options
 * @param {Boolean} options.unknowFields Default to false
 */
const resolveFieldsMiddleware = (options = DEFAULT_OPTIONS) => {
  return (req, res, next) => {
    
    /**
     * Resolve fields FN
     * @param {Object|Array} param1
     * @param {Array} param1.fields
     * @param {Array} param1.defaults
     * @param {null|Array} param2
     * @returns {Array} Resolved fields
     */
    req.resolveFields = (param1, param2 = null) => {
      try {
        var schema = {
          fields: null,
          defaults: null
        };

        if (typeof param1 == 'object') {
          if (Array.isArray(param1.fields)) {
            schema.fields = [ ...param1.fields ];
          }

          if (Array.isArray(param1.defaults) && param1.defaults.length > 0) {
            schema.defaults = [ ...param1.defaults ];
          }
        }

        if (Array.isArray(param1)) {
          schema.fields = [ ...param1 ];
        }

        if (Array.isArray(param2) && param2.length > 0) {
          schema.defaults = [ ...param2 ];
        }

        return resolveFieldsFn(schema, req, options);
      } catch (e) {
        return [];
      }
    };

    next();
  }
};

module.exports = resolveFieldsMiddleware;