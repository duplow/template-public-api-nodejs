const express = require('express');
const { HttpStatusError } = require('common-errors');

const router = express.Router();

const parseItem = (item) => {
  return {
    ...item,
    latitude: item.latitude ? parseFloat(item.latitude) : undefined,
    longitude: item.longitude ? parseFloat(item.longitude) : undefined
  }
}

router.get('/', async (req, res, next) => {
  try {
    const { knex } = req.app.locals;
    const enableDeletedRecords = req.query.deleteds && req.query.deleteds === 'true';
    const querySizeDefault = 20;
    const querySizeMax = 100;
    var queryFrom = 0;
    var querySize = querySizeDefault;

    var query = knex.table('service');

    if (!enableDeletedRecords) {
      query = query.whereNull('deletedAt');
    }

    if (req.query.q) {
      query.where(knex.raw(`to_tsvector(LOWER("name")) @@ to_tsquery(LOWER(?))`, [ req.query.q.replace(' ', '%') ]))
    }

    if (req.query.from && parseInt(req.query.from) > 0) {
      queryFrom = parseInt(req.query.from);
    }

    if (req.query.size && parseInt(req.query.size) > 0 && parseInt(req.query.size) <= querySizeMax) {
      querySize = parseInt(req.query.size);
    }

    if (req.query.projectId /*&& isUUID(req.query.projectId)*/) {
      query = query.where('projectId', req.query.projectId);
    }

    var countQueryPromise = query.clone().clearSelect().count('*').first();
    var resultQueryPromise = query.clone().offset(queryFrom).limit(querySize).orderBy('name', 'asc');

    var countQuery = await countQueryPromise;
    var resultQuery = await resultQueryPromise;

    res.status(200)
      .header('X-Offset', queryFrom)
      .header('X-Limit', querySize)
      .header('X-Total-Count', countQuery.count)
      .json({
        data: {
          count: parseInt(countQuery.count),
          items: resultQuery.map(parseItem)
        }
      });
  } catch (e) {
    next(e);
  }
});

router.post('/', async (req, res, next) => {  
  try {
    const { knex, redis } = req.app.locals;

    // TODO: Add tags

    var insertedIds = await knex
      .table('service')
      .returning('id')
      .insert({
        id: req.body.id || undefined,
        projectId: req.body.projectId,
        markerId: req.body.markerId || null,
        cardId: req.body.cardId || null,
        trackCode: req.body.trackCode || null,
        name: req.body.name,
        latitude: req.body.latitude,
        longitude: req.body.longitude
      });

    redis.publish('services', JSON.stringify({ type: 'created', id: insertedIds[0] }));

    res.status(201).json({
      data: {
        id: insertedIds[0]
      }
    });
  } catch (e) {
    return next(e);
  }
});

router.get('/:serviceId', async (req, res, next) => {
  try {
    const { knex } = req.app.locals;
    const enableDeletedRecords = req.query.deleteds && req.query.deleteds === 'true';

    var query = knex
      .table('service')
      .where('id', req.params.serviceId);

    if (!enableDeletedRecords) {
      query = query.whereNull('deletedAt');
    }

    var record = await query.first();

    if (!record) {
      throw new HttpStatusError(404);
    }

    res.status(200).json({
      data: {
        ...parseItem(record)
      }
    });
  } catch (e) {
    next(e);
  }
});

router.put('/:serviceId', async (req, res, next) => {
  try {
    const { knex, redis } = req.app.locals;

    var changedAttributes = {
      projectId: req.body.projectId || undefined,
      markerId: req.body.markerId || undefined,
      cardId: req.body.cardId || undefined,
      trackCode: req.body.trackCode || undefined,
      name: req.body.name || undefined,
      latitude: req.body.latitude || undefined,
      longitude: req.body.longitude || undefined,
      deletedAt: req.body.deletedAt === null ? null : undefined
    };

    var updatedCount = await knex
      .table('service')
      .update({
        ...changedAttributes,
        updatedAt: knex.raw('NOW()')
      })
      .where('id', req.params.serviceId)
      .where(function () {
        Object.entries(changedAttributes)
          .forEach(([ attributeName, attributeValue ]) => {
            if (attributeValue !== undefined) {
              this.orWhere(attributeName, '<>', attributeValue);
            }
          });        
      });

    // TODO: Change trackCode to uid

    try {      
      await knex
        .table('service_history')
        .insert({
          projectId: knex.raw(`(SELECT "projectId" FROM "service" WHERE "id" = ? LIMIT 1)`, [ req.params.serviceId ]),
          serviceId: req.params.serviceId,
          //userId: null,
          event: 'updated',
          wasDataModified: updatedCount > 0
        });
    } catch (e) {
      console.log(`Unable write change log: ${e.message || e.toString()}`);
    }

    redis.publish('services', JSON.stringify({ type: 'updated', id: req.params.serviceId }));

    res.status(200).json({
      data: {
        updatedCount: updatedCount
      }
    });
  } catch (e) {
    next(e);
  }
});

router.delete('/:serviceId', async (req, res, next) => {
  try {
    const { redis, knex } = req.app.locals;

    var deleteCount = await knex
      .table('service')
      .update({ deletedAt: knex.raw('NOW()') })
      .where('id', req.params.serviceId)
      .whereNull('deletedAt');

    redis.publish('services', JSON.stringify({ type: 'deleted', id: req.params.serviceId }));

    res.status(200).json({
      data: {
        deleteCount: deleteCount
      }
    });
  } catch (e) {
    next(e);
  }
});

module.exports = router;