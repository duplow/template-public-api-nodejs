const publicIp = require('public-ip');
const privateIp = require('internal-ip');

/**
 * Create service registration service
 * @param {Number} port Running port 
 * @param {Kne} knex Knex instance
 * @returns {Object}
 */
const createServiceRegistration = (port, knex) => {
  var registredId = null;
  
  return {

    /**
     * Register service
     */
    register: async () => {
      //var publicAddrPromise = publicIp.v4();
      var privateAddrPromise = privateIp.v4();
      //var publicAddr = await publicAddrPromise;
      var privateAddr = await privateAddrPromise;
      //var ip = privateAddr || publicAddr || '0.0.0.0';
      var ip = privateAddr || '0.0.0.0';

      var insertQuery = await knex.table('service_registration')
        .insert({
          type: 'api-server',
          description: `API server (${port})`,
          hostname: `${ip}:${port}`,
          state: 'up'
        })
        .returning('id');

      await knex.table('service_registration_history')
        .insert({
          state: 'up',
          clientId: insertQuery[0],
          hostname: `${ip}:${port}`
        });

      registredId = insertQuery[0];
      return registredId;
    },

    // TODO: Add support to heartbeat +filed lastActiveAt / lastSeenAt
    // TODO: Rename column timestamp tp createdAt

    /**
     * Unregister service
     */
    unregister: async () => {
      if (registredId) {
        await knex.table('service_registration_history')
          .insert({
            state: 'down',
            clientId: registredId,
            hostname: knex.raw('(SELECT "hostname" FROM "service_registration" WHERE "id" = ? LIMIT 1)', [ registredId ]),
          });

        await knex.table('service_registration')
          .where('id', registredId)
          .update({
            state: 'down'
          });

        /*
        await knex
          .table('service_registration')
          .where('id', registredId)
          .delete();
        */

        return true;
      }

      return false;
    }
  }
};

module.exports = createServiceRegistration;