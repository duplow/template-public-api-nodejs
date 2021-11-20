const express = require('express');
const router = express.Router();
const { HttpStatusError, ArgumentError } = require('common-errors');
const bluebird = require('bluebird');

/**
 * Get service projectId
 * @param {String} serviceId 
 * @param {Redis} redis 
 * @returns {Promise}
 */
const getCachedProjectId = (serviceId, redis) => {
  return new Promise((resolve, reject) => {
    redis.get(`service_${serviceId}.project_id`, (err, value) => {
      if (err) reject(err);
      resolve(value);
    });
  });
}

/**
 * Set service projectId (TTL 30s)
 * @param {String} serviceId 
 * @param {String} value 
 * @param {Redis} redis 
 * @returns {Promise}
 */
const setCachedProjectId = (serviceId, value, redis) => {
  return new Promise((resolve, reject) => {
    redis.setex(`service_${serviceId}.project_id`, 30, value, (err, value) => {
      if (err) reject(err);
      resolve(value);
    });
  });
};

router.put('/', async (req, res, next) => {
  try {
    const { knex, redis } = req.app.locals;

    var projectId = await getCachedProjectId(req.body.serviceId, redis);

    if (!projectId) {
      var service = await knex
        .table('service')
        .select('projectId')
        .where('id', req.body.serviceId)
        .first();

      projectId = service.projectId;
      await setCachedProjectId(req.body.serviceId, service.projectId, redis);
    }
    
    var updateCount = 0;
    var insertCount = 0;

    updateCount = await knex
      .table('service_attribute')
      .update({
        attributeValue: req.body.attributeValue,
        lastUpdatedAt: knex.raw('NOW()')
      })
      .where('serviceId', req.body.serviceId)
      .where('attributeId', req.body.attributeId);

    if (updateCount === 0) {
      insertCount = (await knex
        .table('service_attribute')
        .insert({
          projectId: projectId,
          serviceId: req.body.serviceId,
          attributeId: req.body.attributeId,
          attributeValue: req.body.attributeValue,
          //lastUpdatedAt: knex.raw('NOW()')
        })
        .returning('id')).length;
    }

    await knex
      .table('service_attribute_history')
      .insert({
        projectId: projectId,
        serviceId: req.body.serviceId,
        attributeId: req.body.attributeId,
        attributeValue: req.body.attributeValue
      });

    redis.publish('services', JSON.stringify({
      type: 'updated',
      id: req.body.serviceId
    }));

    redis.publish('service_attributes', JSON.stringify({
      type: 'updated',
      serviceId: req.body.serviceId,
      attributeId: req.body.attributeId,
      attributeValue: req.body.attributeValue
    }));

    res.status(200)
      .json({
        data: {
          updateCount: updateCount,
          insertCount: insertCount
        }
      });
  } catch (e) {
    next(e);
  }
});

// Bulk synchronous
router.put('/bulk', async (req, res, next) => {  
  try {
    const { knex, redis } = req.app.locals;

    if (!Array.isArray(req.body.items)) {
      throw new ArgumentError('items');
    }

    // TODO: Handle request timeout

    // Create bulk request record
    // Try parse bulk records
    // Update bulk request with response
    // Send response


    /*
     * Upsert

      INSERT INTO "service_attribute" (
        "projectId",
        "serviceId",
        "attributeId",
        "attributeValue"
      ) VALUES (
        (SELECT "projectId" FROM "service" WHERE "id" = "service_attribute"."serviceId" LIMIT 1),
        '0531edb5-9a36-4a71-94eb-a0522def8bff',
        '2d7232f6-44b1-48bf-b1d9-3b188961ee45',
        'valor1'
      )
      ON CONFLICT ON CONSTRAINT "service_attribute_projectid_serviceid_attributeid_unique"
      DO
        UPDATE SET "attributeValue" = "service_attribute"."attributeValue";
     */

    var responses = await bluebird.mapSeries(req.body.items, async (item, index) => {
      var projectId = await getCachedProjectId(item.serviceId, redis);

      if (!projectId) {
        var service = await knex
          .table('service')
          .select('projectId')
          .where('id', item.serviceId)
          .first();

        projectId = service.projectId;
        await setCachedProjectId(item.serviceId, service.projectId, redis);
      }

      var updateCount = 0;
      var insertCount = 0;

      updateCount = await knex
        .table('service_attribute')
        .update({
          attributeValue: item.attributeValue,
          lastUpdatedAt: knex.raw('NOW()')
        })
        .where('serviceId', item.serviceId)
        .where('attributeId', item.attributeId);

      if (updateCount === 0) {
        insertCount = (await knex
          .table('service_attribute')
          .insert({
            projectId: projectId,
            serviceId: item.serviceId,
            attributeId: item.attributeId,
            attributeValue: item.attributeValue,
            //lastUpdatedAt: knex.raw('NOW()')
          })
          .returning('id')).length;
      }

      await knex
        .table('service_attribute_history')
        .insert({
          projectId: projectId,
          serviceId: item.serviceId,
          attributeId: item.attributeId,
          attributeValue: item.attributeValue
        });

      redis.publish('services', JSON.stringify({
        type: 'updated',
        id: item.serviceId
      }));

      redis.publish('service_attributes', JSON.stringify({
        type: 'updated',
        serviceId: item.serviceId,
        attributeId: item.attributeId,
        attributeValue: item.attributeValue
      }));

      return {
        index,
        response: {
          updateCount: updateCount,
          insertCount: insertCount
        }
      };
    }, { concurrency: 1 });
    
    res.status(200)
      .json({
        data: {
          items: responses
        }
      });
  } catch (e) {
    next(e);
  }
});

// Bulk asynchronous
router.put('/bulk/async', async (req, res, next) => {
  // Code here
});

module.exports = router;