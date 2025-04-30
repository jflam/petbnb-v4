/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable('sitters', (table) => {
    // add with default '' so NOT NULL passes for existing rows
    table.string('address').notNullable().defaultTo('');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable('sitters', (table) => {
    table.dropColumn('address');
  });
};
