const publicIp = require('public-ip');
const privateIp = require('internal-ip');

module.exports = {
  /**
   * Register service (ex: DNS, Consul, HAProxy, Traefik, Nginx)
   * @param {Number} pid Process ID
   * @param {String} ipv4 Private or Public IP
   * @param {Number} port Running PORT
   * @returns {Promise} Registred service
   * @throws {NotRegistredException}
   */
  register: async (ipv4, port) => {
    /*
    //var publicAddrPromise = publicIp.v4();
    var privateAddrPromise = privateIp.v4();
    //var publicAddr = await publicAddrPromise;
    var privateAddr = await privateAddrPromise;
    var ip = privateAddr || publicAddr || '0.0.0.0';

    var insertQuery = await knex.table('service_registration')
      .insert({
        type: 'api-server',
        description: `API server (${port})`,
        address: `${ip}:${port}`
      })
      .returning('id');

    registredId = insertQuery[0];
    return registredId;
    */

    return Promise.resolve({
      id: process.pid,
      description: `Private API (${process.pid}) :${port}`,
      addr: `${ipv4}:${port}`,
      isPublic: false
    });
  },

  /**
   * Unregister service
   * @param {String} ipv4 Private or Public IP
   * @param {Number} port Running PORT
   * @returns {Promise}
   * @throws {NotRegistredException}
   */
  unregister: async (ipv4, port) => {
    // TODO: Unregister client
  }
};