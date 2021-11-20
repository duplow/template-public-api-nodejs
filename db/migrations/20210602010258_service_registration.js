
exports.up = function (knex) {
  return knex.schema.createTable('service_registration', function (table) {
    // Columns
    table.uuid('id').unique().primary().notNullable().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('type', 20).notNullable();
    table.string('description', 120).notNullable();
    table.string('hostname', 40).notNullable(); // .unique();
    table.string('state', 10).notNullable().defaultTo('up');
    // table.string('environment', 10).notNullable().defaultTo('dev'); // stage
    // table.string('version', 10).notNullable().defaultTo('v1.0.0');
    table.timestamp('createdAt').notNullable().defaultTo(knex.fn.now());
    table.timestamp('lastSeenAt').notNullable().defaultTo(knex.fn.now());

    //table.timestamp('timestamp').notNullable().defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('service_registration');
};
