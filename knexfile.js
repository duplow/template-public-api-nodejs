const dotenv = require('dotenv');

dotenv.config(); // Load environment vars

const dbOptions = {
  client: 'pg',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'postgres',
    database: process.env.DB_NAME || 'postgres',
    timezone: 'utc',
  },
  pool: {
    propagateCreateError: false,
    min: 1,
    max: 20 // TODO: Remove later?
  },
  migrations: {
    directory: './db/migrations'
  },
  seeds: {
    directory: './db/seeds'
  },
  debug: false
};

module.exports = dbOptions;
