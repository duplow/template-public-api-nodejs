const express = require('express');

// Route and groups
const projectsRouter = require('./routes/projects.router.js');
const servicesRouter = require('./routes/services.router.js');
const attributesRouter = require('./routes/attributes.router.js');
const markersRouter = require('./routes/markers.router.js');
const cardsRouter = require('./routes/cards.router.js');
const bulksRouter = require('./routes/bulk.router.js');
const serviceAttributesRouter = require('./routes/service-attributes.router.js');
const usersRouter = require('./routes/users.group.js');
const invitesRouter = require('./routes/invites.group.js');
const mediaRouter = require('./routes/media.group.js');

const notImplementedHandler = (req, res, next) => {
  next(new Error('Not implemented yet'));
};

const router = express.Router();

router.use('/v1/projects', projectsRouter);
router.use('/v1/markers', markersRouter);
router.use('/v1/cards', cardsRouter);
router.use('/v1/attributes', attributesRouter);
router.use('/v1/services', servicesRouter);
router.get('/v1/advanced-search', notImplementedHandler); // TODO: Perform service advanced queries

// Members management
router.use('/v1/users', usersRouter); // TODO: Manage user accounts: register, update, enable, disable, change password, confirm email
router.use('/v1/users-acl', notImplementedHandler); // TODO: Manage project policies and permissions
router.use('/v1/invites', invitesRouter); // TODO: Manage project invitations

// Media management
router.use('/v1/media', mediaRouter);
router.use('/v1/services-files', notImplementedHandler); // TODO: Manage service attachments

router.use('/v1/service-attributes', serviceAttributesRouter);

// Batching requests
router.use('/v1/batch/attachment-binding', notImplementedHandler);
router.use('/v1/batch/attribute-binding', notImplementedHandler);

// Painter: Painting service
router.use('/v1/painter', bulksRouter);

module.exports = router;