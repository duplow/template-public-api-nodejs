const knex = require('knex');
const _debug = require('debug');
const debug = _debug('app:db');

const createKnex = (connectionOptions = {}) => {
  const knexParams = {
    client: 'pg',
    connection: {
      host: connectionOptions.host || process.env.DB_HOST || 'localhost',
      port: connectionOptions.port || process.env.DB_PORT || 5432,
      user: connectionOptions.user || process.env.DB_USER || 'postgres',
      password: connectionOptions.password || process.env.DB_PASS || 'postgres',
      database: connectionOptions.database || process.env.DB_NAME || 'postgres',
      timezone: 'utc'
    },
    pool: {
      propagateCreateError: false,
      min: 1,
      max: 100
    },
    debug: false,
    logs: {
      error: function (err) {
        debug(`DB error: ${err.message || err.toString()}`);
      }
    },
    acquireConnectionTimeout: 10000
  };

  const client = knex(knexParams);

  client.on('error', (err) => {
    debug(`DB error: ${err.message || err.toString()}`);
  });

  client.select(client.raw('1'))
    .then(() => {
      state.isReady = true;
      state.isConnected = true;
      debug('Connection ready');
    })
    .catch((err) => {
      debug(`Connection error: ${err.message || err.toString()}`);
    });

  const state = {
    isReady: false,
    isConnected: false,
    client: client
  };

  return state;
}

module.exports = createKnex;
