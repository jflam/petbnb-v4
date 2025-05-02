/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  // Check if address column exists already
  return knex.schema.hasColumn('sitters', 'address').then(exists => {
    if (!exists) {
      return knex.schema.alterTable('sitters', (table) => {
        // add with default '' so NOT NULL passes for existing rows
        table.string('address').notNullable().defaultTo('');
      });
    }
    return Promise.resolve();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.hasColumn('sitters', 'address').then(exists => {
    if (exists) {
      return knex.schema.alterTable('sitters', (table) => {
        table.dropColumn('address');
      });
    }
    return Promise.resolve();
  });
};
