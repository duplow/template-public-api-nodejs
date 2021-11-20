const cors = require('cors');
const express = require('express');
//const bodyParser = require('body-parser');
const requestIdMiddleware = require('express-request-id');
//const debug = require('debug');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./openapi.json');

// Services
const createKnex = require('./services/knex.js');
const createS3 = require('./services/s3.js');
const createSns = require('./services/sns.js');
const createRedis = require('./services/redis.service.js');
//const createPublisher = require('./services/publisher.js');
//const createBroker = require('./services/broker.js');

// Services old
//const cache = require('./.trash/libs/cache'); // DOUBT: Is it still being used?
//const bugsnag = require('../bugsnag'); // TODO: Bugsnag

// Routers
//const graphqlRouter = require('./routes/graphql');
//const adminRouter = require('./routes/admin');
//const schemeRouter = require('./routes/scheme');
//const assetsRouter = require('./routes/assets');
//const testRouter = require('./routes/test');
//const compileStepsRouter = require('./routes/tmp/compile-steps');
//const compileOptionsRouter = require('./routes/tmp/compile-options');
//const snapshotRouter = require('./routes/snapshot');
//const webhooksRouter = require('./routes/webhooks');
//const v1Router = require('./routes/v1/index.js');
//const v2Router = require('./routes/v2/index.js');
//const pushEventHandler = require('./routes/push-event.js');

// Routes
const defaultErrorHandler = require('./routes/error.handler.js');
const healthCheckRoute = require('./routes/healthcheck.route.js');
const appRouter = require('./app.router.js');
const statusRoute = require('./routes/status.route.js');
const statsRoute = require('./routes/stats.route.js');
const labsRouter = require('./routes/labs.router.js'); // TODO: Rename later to labs.group.js

// Middlewares
//const contextMiddleware = require('./middlewares/context.js');
const fieldsResolverMiddleware = require('./middlewares/fields.middleware.js');
const createServiceRegistration = require('./services/registration.service');

const createApp = (port) => {
  const app = express();

  // Services instances
  const knexService = createKnex();
  //const brokerService = createBroker();
  const s3 = createS3();
  const sns = createSns();
  //const redis = createRedis(); // Publisher
  //const subscriber = createRedis(); // Subscriber
  //const publisherService = createPublisher(brokerService.broker);
  //const { requestHandler, errorHandler } = bugsnag.getPlugin('express');
  const discovery = createServiceRegistration(port, knexService.client);

  discovery.register();

  //app.locals.broker = brokerService;
  //app.locals.publisher = publisherService;
  //app.locals.auth = {};
  //app.locals.bugsnag = bugsnag;
  //app.locals.cache = cache;

  app.locals.cognito = {};
  app.locals.knex = knexService.client;
  app.locals.s3 = s3;
  app.locals.sns = sns;
  //app.locals.redis = redis;
  app.locals.discovery = discovery;

  app.disable('etag');

  /*
  app.locals.notify = (params) => {
    try {
      const { topic, correlationId, body } = params;

      var sender = brokerService.broker.open_sender(topic);
      var message = {
        content_type: 'application/json',
        correlation_id: correlationId,
        body: body
      };

      sender.send(message);
    } catch (e) {
      bugsnag.notify(e);
      console.log(e);
    }
  };

  subscriber.on('message', function (channel, message) {
    console.log('Subscriber received message', channel, message);
  });

  subscriber.subscribe('projects');
  */

  // Common middlewares
  app.use(cors());
  app.use(requestIdMiddleware({ setHeader: true }));
  app.use(fieldsResolverMiddleware());
  app.use(morgan(':date[iso] - :method :url :status - :response-time[3]ms - :res[X-Request-Id]'));
  app.use('/docs', swaggerUi.serve);
  app.use('/docs', swaggerUi.setup(swaggerDocument));
  app.get('/healthcheck', healthCheckRoute);
  app.get('/status', statusRoute);
  app.get('/stats', statsRoute);
  app.use('/labs', labsRouter);
  app.use(express.json());
  app.use(appRouter);
  app.use(defaultErrorHandler);

  return app;
}

module.exports = createApp;
