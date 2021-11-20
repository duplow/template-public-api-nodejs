const { basename } = require('path');
const express = require('express');
const glob2Regexp = require('glob-to-regexp');

const router = express.Router();

/**
 * Project media management
 */

const notImplementedHandler = (req, res, next) => {
  next(new Error('Not implemented yet'));
};

router.post('/upload', notImplementedHandler); // Create upload media
router.post('/upload/complete', notImplementedHandler); // Complete upload and generate media

// Filter: projectId, mediaType, mimeType, directoryPath ex: /my-assets/**.jpg | suffix and preffix filename | /root/([a-z-0-9])

router.get('/', async (req, res, next) => {
  try {
    const { knex } = req.app.locals;

    var offset = 0;
    var limit = 100;
    var enableFolders = false;
    var enableFiles = true;

    var query = knex.table('media');

    if (req.query.projectId) {
      query = query.where('projectId', req.query.projectId);
    }

    /*
    if (req.query.mediaType) {
      query = query.where('type', req.query.mediaType);
    }
    */

    if (req.query.mimeType) {
      query = query.where('mime', '~', glob2Regexp(req.query.mimeType, { globstar: false }).source);
    }

    if (req.query.folders && req.query.folders === 'true') {
      enableFolders = true;
    }

    if (req.query.files && req.query.files === 'false') {
      enableFiles = false;
    }

    if (!enableFolders) {
      query = query.whereNot('type', 'folder');
    }

    if (!enableFiles) {
      query = query.whereNot('type', 'file');
    }

    if (req.query.match) {
      query = query.where('fullpath', '~', glob2Regexp(req.query.match, { globstar: true }).source);
    }

    if (req.query.directory) {
      var folderName = req.query.directory.toString().trim();

      if (!folderName.startsWith('/')) {
        folderName = '/' + folderName;
      }

      if (!folderName.endsWith('/')) {
        folderName = folderName + '/';
      }

      query = query.where('fullpath', '~', `^${folderName.replaceAll('/', '\\/')}([^\/]+)$`);
    }

    var countPromise = query.clone().count('*').first();
    var fetchPromise = query.clone().offset(offset).limit(limit);

    var countResult = await countPromise;
    var fetchResult = await fetchPromise;

    res.json({
      data: {
        count: parseInt(countResult.count),
        medias: fetchResult.map((item) => {
          let baseuri = `${req.protocol}://${req.headers.host}/v1/media`;

          return {
            ...item,
            name: basename(item.fullpath),
            _links: {
              self: {
                href: (item.type === 'folder') ? `${baseuri}?directory=${encodeURIComponent(item.fullpath)}&folders=true` : `${baseuri}/${item.id}`
              }
            }
          }
        })
      }
    });
  } catch (e) {
    next(e);
  }
});

router.get('/:mediaIdList', async (req, res, next) => {
  try {
    const { knex } = req.app.locals;

    // TODO: Receives one or more mediaId

    var fetchPromise = knex.table('media')
      .whereIn('id', req.params.mediaIdList.split(','));

    var fetchResult = await fetchPromise;

    res.json({
      medias: [
        ...fetchResult.map((item) => {
          let baseuri = `${req.protocol}://${req.headers.host}/v1/media`;

          return {
            ...item,
            name: basename(item.fullpath),
            _links: {
              self: {
                href: (item.type === 'folder') ? `${baseuri}?directory=${encodeURIComponent(item.fullpath)}&folders=true` : `${baseuri}/${item.id}`
              }
            }
          }
        })
      ]
    });
  } catch (e) {
    console.log(e);
    next(e);
  }
});

router.put('/:mediaId', notImplementedHandler); // Update media
router.delete('/:mediaId', notImplementedHandler); // Delete media

// TODO: Add preview/thumbnail?
// TODO: Move/rename
// TODO: Copy?

module.exports = router;