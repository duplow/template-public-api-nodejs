const express = require('express');
const router = express.Router();
const { HttpStatusError } = require('common-errors');

router.get('/', async (req, res, next) => {
  try {
    const { knex } = req.app.locals;
    const enableDeletedRecords = req.query.deleteds && req.query.deleteds === 'true';
    const querySizeDefault = 20;
    const querySizeMax = 100;
    var queryFrom = 0;
    var querySize = querySizeDefault;

    var query = knex.table('attribute');

    if (!enableDeletedRecords) {
      query = query.whereNull('deletedAt');
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
    var resultQueryPromise = query.clone().offset(queryFrom).limit(querySize).orderBy('order', 'asc').orderBy('name', 'asc');

    var countQuery = await countQueryPromise;
    var resultQuery = await resultQueryPromise;

    res.status(200)
      .header('X-Offset', queryFrom)
      .header('X-Limit', querySize)
      .header('X-Total-Count', countQuery.count)
      .json({
        data: {
          count: parseInt(countQuery.count),
          items: resultQuery
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
      .table('attribute')
      .returning('id')
      .insert({
        id: req.body.id || undefined,
        projectId: req.body.projectId,
        name: req.body.name,
        format: req.body.format || 'text',
        order: req.body.order || undefined,
        isSearchable: (req.body.isSearchable && req.body.isSearchable === true) ? true : false,
        isDisabled: (req.body.isDisabled && req.body.isDisabled === true) ? true : false,
        isPinned: (req.body.isPinned && req.body.isPinned === true) ? true : false
      });

    redis.publish('attributes', JSON.stringify({ type: 'created', id: insertedIds[0] }));

    res.status(201).json({
      data: {
        id: insertedIds[0]
      }
    });
  } catch (e) {
    return next(e);
  }
});

router.get('/:attributeId', async (req, res, next) => {
  try {
    const { knex } = req.app.locals;
    const enableDeletedRecords = req.query.deleteds && req.query.deleteds === 'true';

    var query = knex
      .table('attribute')
      .where('id', req.params.attributeId);

    if (!enableDeletedRecords) {
      query = query.whereNull('deletedAt');
    }

    var record = await query.first();

    if (!record) {
      throw new HttpStatusError(404);
    }

    res.status(200).json({
      data: {
        ...record
      }
    });
  } catch (e) {
    next(e);
  }
});

router.put('/:attributeId', async (req, res, next) => {
  try {
    const { knex, redis } = req.app.locals;

    var updatedCount = await knex
      .table('attribute')
      .update({
        projectId: req.body.projectId,
        name: req.body.name,
        format: req.body.format || 'text',
        order: req.body.order || undefined,
        isSearchable: (req.body.isSearchable && req.body.isSearchable === true) ? true : false,
        isDisabled: (req.body.isDisabled && req.body.isDisabled === true) ? true : false,
        isPinned: (req.body.isPinned && req.body.isPinned === true) ? true : false,
        //updatedAt: knex.raw('NOW()'),
        deletedAt: req.body.deletedAt === null ? null : undefined,
      })
      .where('id', req.params.attributeId);

    redis.publish('attributes', JSON.stringify({ type: 'updated', id: req.params.attributeId }));

    res.status(200).json({
      data: {
        updatedCount: updatedCount
      }
    });
  } catch (e) {
    next(e);
  }
});

router.delete('/:attributeId', async (req, res, next) => {
  try {
    const { redis, knex } = req.app.locals;

    var deleteCount = await knex
      .table('attribute')
      .update({ deletedAt: knex.raw('NOW()') })
      .where('id', req.params.attributeId)
      .whereNull('deletedAt');

    redis.publish('attributes', JSON.stringify({ type: 'deleted', id: req.params.attributeId }));

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