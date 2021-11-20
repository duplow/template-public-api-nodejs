const rhea = require('rhea');
const debug = require('debug')('app:broker');

const createBroker = (connection = {}) => {
  const rheaParams = {
    transport: connection.transport || process.env.AMQP_TRANSPORT || undefined,
    host: connection.host || process.env.AMQP_HOST || 'localhost',
    port: connection.port || process.env.AMQP_PORT || '5672',
    username: connection.username || process.env.AMQP_USER || undefined,
    password: connection.password || process.env.AMQP_PASS || undefined
  };

  const broker = rhea.connect(rheaParams);

  const state = {
    isReady: false,
    isConnected: false,
    broker: broker
  };

  broker.on('error', function (e) {
    state.error = e;
    debug(`error: ${e.message || e.toString()}`);
  });

  broker.on('connection_open', function (e) {
    state.isReady = true;
    state.isConnected = true;
    debug('connection_open');
  });

  broker.on('connection_error', function (e) {
    state.isConnected = false;
    debug(`connection_error: ${e.message || e.toString()}`);
  });

  broker.on('connection_close', function (e) {
    state.isConnected = false;
    debug('connection_close');
  });

  broker.on('disconnected', function (e) {
    state.isConnected = false;
    debug('disconnected');
  });

  broker.on('reconnected', function (e) {
    debug('reconnected');
  });

  return state;
}

module.exports = createBroker;
