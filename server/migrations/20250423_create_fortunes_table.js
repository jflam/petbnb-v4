/**
 * @param { import("knex").Knex } knex
 */
exports.up = (knex) =>
  knex.schema.createTable('fortunes', (table) => {
    table.increments('id').primary();
    table.text('text').notNullable();
  });

exports.down = (knex) =>
  knex.schema.dropTableIfExists('fortunes');
