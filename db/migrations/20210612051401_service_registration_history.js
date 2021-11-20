
exports.up = function (knex) {
  return knex.schema.createTable('service_registration_history', function (table) {
    // Columns
    table.uuid('id').unique().primary().notNullable().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('clientId').notNullable();
    table.string('hostname', 40).notNullable();
    table.string('state', 10).notNullable();
    table.timestamp('timestamp').notNullable().defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('service_registration_history');
};
