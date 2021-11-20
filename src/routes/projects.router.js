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

    var query = knex.table('project');

    if (!enableDeletedRecords) {
      query = query.whereNull('deletedAt');
    }

    if (req.query.from && parseInt(req.query.from) > 0) {
      queryFrom = parseInt(req.query.from);
    }

    if (req.query.size && parseInt(req.query.size) > 0 && parseInt(req.query.size) <= querySizeMax) {
      querySize = parseInt(req.query.size);
    }

    if (req.query.tags && req.query.tags.trim().length > 0) {      
      req.query.tags
        .trim()
        .split(',')
        .forEach((tagging) => {
          query = query.where('tags', '@>', knex.raw(`ARRAY[?]::varchar[]`, [tagging]))
        });

      /*
      if (req.query.tags.split(',').length > 0) {
        query = query.where('tags', '@>', knex.raw(`ARRAY[${req.query.tags.split(',').map(() => '?').join(',')}]::varchar[]`, [ ...req.query.tags.split(',')]));
      }
      */
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

    /*
    throw new HttpStatusError(404);

    if (!req.body.asasj) {
      throw { code: 'validation', field: 'asasj' };
    }
    */

    // TODO: Create default markerId ?
    // TODO: Create default cardId ?

    var insertedIds = await knex
      .table('project')
      .returning('id')
      .insert({
        name: req.body.name,
        ownerId: req.body.ownerId
      });
    
    redis.publish('projects', JSON.stringify({ type: 'created', id: insertedIds[0] }));

    res.status(201).json({
      error: null,
      data: {
        id: insertedIds[0]
      }
    });
  } catch (e) {
    return next(e);
  }
});

router.get('/:projectId', (req, res, next) => {
  res.status(200).json('OK');
});

router.put('/:projectId', (req, res, next) => {
  try {
    const { redis } = req.app.locals;
    redis.publish('projects', JSON.stringify({ type: 'updated', id: req.params.projectId }));
    res.status(200).json('OK');
  } catch (e) {
    next(e);
  }
});

router.delete('/:projectId', (req, res, next) => {
  try {
    const { redis } = req.app.locals;
    redis.publish('projects', JSON.stringify({ type: 'deleted', id: req.params.projectId }));
    res.status(200).json('OK');
  } catch (e) {
    next(e);
  }
});

module.exports = router;