const knex = require('knex');
const dbOptions = require('./knexfile');

module.exports = knex(dbOptions);
