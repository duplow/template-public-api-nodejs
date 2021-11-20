const express = require('express');
const supertest = require('supertest');
const debug = require('debug');

const router = express.Router();
const log = debug('app:healthcheck');

/**
 * Resolve a promise to up down string
 * @param {Promise} promise
 * @returns {Promise}
 */
function toHealthcheck (promise) {
  return new Promise((resolve) => {
    promise
      .then(() => {
        resolve('up');
      })
      .catch(() => {
        resolve('down');
      })
  });
};

/**
 * Combine service responses
 * @param {Object} services
 * @returns {String}
 */
function combineResponses (services) {
  var res = 'up';

  Object.entries(services)
    .forEach(([service, state]) => {
      if (state !== 'up') {
        res = 'down';
      }
    });
  return res;
};

/**
 * Parse a boolean status as human legible text
 * @param {Boolean} status 
 * @returns {String} status as HL
 */
function parseStatusAsText (status) {
  return status ? 'up' : 'down';
}

const requestHandler = async (req, res, next) => {
  try {
    log('Requesting...');
    const { knex } = req.app.locals;

    const databaseHealthcheckPromise = toHealthcheck(knex.select(knex.raw('1')));
    const databaseHealthCheck = await databaseHealthcheckPromise;

    /*
    const { knex, broker } = req.app.locals;

    const authHealthCheckPromise = toHealthcheck(supertest(process.env.AUTH_API).get('/status').expect(200));
    const searchHeathCheckPromise = toHealthcheck(supertest(process.env.SEARCH_API).get('/status').expect(200));
    const databaseHealthcheckPromise = toHealthcheck(knex.select(knex.raw('1')));

    const databaseHealthCheck = await databaseHealthcheckPromise;
    const authHealthCheck = await authHealthCheckPromise;
    const searchHeathCheck = await searchHeathCheckPromise;
    const brokerHealthCheck = broker.isReady && broker.isConnected;

    const health = {
      services: {
        auth: authHealthCheck,
        search: searchHeathCheck,
        database: databaseHealthCheck ? 'up' : 'down',
        broker: brokerHealthCheck ? 'up' : 'down'
      }
    };

    const statusText = combineResponses(health.services) === 'up' ? 'healthy' : 'unhealthy';

    log(`Status: ${statusText}`);
    health.status = statusText;
    res.json(health);
    */

    res.json({
      data: {
        healthy: true,
        services: [
          {
            name: 'database',
            status: parseStatusAsText(databaseHealthCheck)
          }
        ]
      }
    });
  } catch (e) {
    log('Error');
    next(e);
  }
};

module.exports = requestHandler;