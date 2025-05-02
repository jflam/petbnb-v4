/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable('sitters', (table) => {
    // Make latitude and longitude columns nullable
    table.decimal('latitude', 10, 6).alter().nullable();
    table.decimal('longitude', 10, 6).alter().nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable('sitters', (table) => {
    // Restore to NOT NULL with default values
    table.decimal('latitude', 10, 6).alter().notNullable().defaultTo(0);
    table.decimal('longitude', 10, 6).alter().notNullable().defaultTo(0);
  });
};