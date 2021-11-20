exports.up = function (knex) {
  return knex.schema.createTable('user', function (table) {
    // Columns
    table.uuid('id').unique().primary().notNullable().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('username').notNullable();
    table.string('password').notNullable();
    table.timestamp('createdAt').notNullable().defaultTo(knex.fn.now());
    table.timestamp('deletedAt');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('user');
};
