const dotenv = require('dotenv');
const cluster =require('cluster');
const http = require('http');
const getPort = require('get-port'); // TODO: Replace with "port-finder"?
const os = require('os');
const { spawn } = require('child_process');
const createApp = require('./src/app.js');

dotenv.config(); // Load environment vars

// Load app config.ini
const DEFAULT_PORT = process.env.APP_PORT || process.env.PORT || 4000; // Configure server default PORT
const MAX_TIMEOUT = 30 * 60 *1000; // Configure server max hard timeout 30m
const NUM_CPUS =  os.cpus().length || 1; // Configure number of threads

var server, app, port = null;

const events = {
  onInit: () => {
    console.log(`Node.js template for Private APIs is listening on port %s (pid: ${process.pid})`, port);

    if (process.emit) {
      process.emit('ready');
    }
  },
  onShutdown: () => {
    if (!app || !app.locals) {
      return;
    }
    
    app.locals.discovery.unregister()
      .then(() => {
        console.log('Unregistred service');
        process.exit(0);
      })
      .catch(console.error);
  }
};

if (cluster.isMaster) {
  console.log(`Node.js template for Private APIs master is running (pid: ${process.pid})`);

  for (let i = 0; i < NUM_CPUS; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });

  cluster.on('disconnect', () => {
    console.log('worker disconnected');
  });

  cluster.on('error', () => {
    console.log('worker crashed');
  });
}

/**
 * Bootstrap app
 */
const main = async () => {
  const getPortOptions = {
    port: parseInt(DEFAULT_PORT)
  };

  port = 4000;

  /*
  if (!port) {
    port = await getPort(getPortOptions);
  }
  */

  app = createApp(port);
  server = http.createServer(app);
  server.setTimeout(MAX_TIMEOUT);
  server.listen(port, events.onInit);
};

process.on('SIGHUP', events.onShutdown);
process.on('SIGINT', events.onShutdown);
process.on('SIGTERM', events.onShutdown);

if (!cluster.isMaster) {
  main();
}
