const express = require('express');
const bodyParser = require('body-parser');
//const bluebird = require('bluebird');

const isUUID = () => true;

const router = express.Router();
const { HttpStatusError, ArgumentError, ArgumentNullError } = require('common-errors');

router.use(bodyParser.json({ limit: '15mb' }));

// Filter deploys
router.get('/', async (req, res, next) => {
  try {
    const { knex } = req.app.locals;

    var query = knex
      .table('painter_service_deploy');

    if (req.query.projectId) {
      query = query.where('projectId', req.query.projectId);
    }

    var results = await query
      .orderBy('timestamp', 'desc')
      .limit(20);

    res.json({
      data: {
        count: results.length,
        items: results
      }
    });
  } catch (e) {
    next(e);
  }
});

// Fetch a deploy
router.get('/:deployId', async (req, res, next) => {
  try {
    const { knex } = req.app.locals;

    var deployInfo = await knex
      .table('painter_service_deploy')
      .where('id', req.params.deployId)
      .first();

    if (!deployInfo) {
      throw new HttpStatusError(404);
    }

    res.json({
      data: {
        ...deployInfo
      }
    });
  } catch (e) {
    next(e);
  }
});

// Create a new deploy | Bulk synchronous
router.post('/', async (req, res, next) => {  
  try {
    const { knex, redis } = req.app.locals;

    // TODO: Handle request timeout    

    var projectId = req.header('X-Project-Id').trim() || '';

    if (projectId.length === 0) {
      throw new ArgumentNullError('X-Project-Id');
    }

    if (!isUUID(projectId)) {
      throw new ArgumentError('X-Project-Id');
    }

    if (!Array.isArray(req.body)) {
      throw new ArgumentError('body');
    }

    // TODO: Validate projectId UUID-v4
    // TODO: Validate body    

    var error = null;

    for(var i = 0; i < req.body.length; i++) {
      let current = req.body[i];

      if (typeof current !== 'object') {
        error = { message: 'Item must be a valid object with uid' };
        break;
      }

      if (!current.hasOwnProperty('uid') || typeof current.uid !== 'string') {
        error = { message: 'Item.uid must be a valid string' };
        break;
      }

      if (current.attributes !== undefined && typeof current.attributes !== 'object') {
        error = { message: 'Item.attributes must be a valid object' };
        break;
      }
    }

    if (error) {
      throw error;
    }

    var deployId = await knex
      .table('painter_service_deploy')
      .insert({
        projectId: projectId,
        size: req.body.length,
        //validationStatus: 'RUNNING',
        //creationStatus: 'NOT_STARTED',
      })
      .returning('id');

    res.status(201)
      .header('X-Deploy-Id', deployId)
      .json({
        data: {
          id: deployId
        }
      });

    for (var i = 0; i < req.body.length; i++) {
      let current = req.body[i];

      redis.publish('painter_deploy_pipeline', JSON.stringify({
        projectId: projectId, // X-Correlation-Id
        deployId: deployId, // X-Correlation-Id
        uid: current.uid,
        name: current.name || current.uid,
        latitude: current.latitude || undefined,
        longitude: current.longitude || undefined,
        attributes: current.attributes || {}
      }));
    }

    // Get project id
    // Fetch existing attributes
    // Create new attributes
    // Hide uncommited attributes (MISSING)
    // Fetch existing service
    // Create new service
    // Hide uncommited services (MISSING)
    // Paint services
    // Deploy changes / Spread changes


    // TODO: Make painter accepts SQL like queries
    
    /*
    set markerId = X
    set cardId = Y
    WHEN (
      attribute.dataPrevista < attribute.dataExecucao
      and
      attribute.dataExecucao >= NOW()
    )
    */
  } catch (e) {
    console.log(e);
    next(e);
  }
});

// Bulk asynchronous
router.put('/async', async (req, res, next) => {
  // Code here
});

module.exports = router;