/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.table('sitters', (table) => {
    table.json('special_needs').nullable(); // Array of special needs capabilities
    table.json('home_features').nullable(); // Array of home features
    table.integer('median_response_time').nullable(); // In hours
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.table('sitters', (table) => {
    table.dropColumn('special_needs');
    table.dropColumn('home_features');
    table.dropColumn('median_response_time');
  });
};
