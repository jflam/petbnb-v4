/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.hasColumn('sitters', 'latitude').then(hasLatitude => {
    // If latitude exists, make sure it's nullable
    if (hasLatitude) {
      return knex.schema.alterTable('sitters', table => {
        table.decimal('latitude', 10, 6).alter().nullable();
        table.decimal('longitude', 10, 6).alter().nullable();
      });
    }
    return Promise.resolve();
  }).then(() => {
    // Ensure address column exists and is properly defined
    return knex.schema.hasColumn('sitters', 'address').then(hasAddress => {
      if (!hasAddress) {
        return knex.schema.alterTable('sitters', table => {
          table.string('address').notNullable().defaultTo('');
        });
      } else {
        // Make sure address is NOT NULL with a default
        return knex.raw(`PRAGMA table_info(sitters)`).then(info => {
          const addressColumn = info.find(col => col.name === 'address');
          if (addressColumn && addressColumn.notnull === 0) {
            return knex.schema.alterTable('sitters', table => {
              table.string('address').notNullable().defaultTo('').alter();
            });
          }
          return Promise.resolve();
        });
      }
    });
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  // This is a fix migration, so down doesn't need to do anything
  return Promise.resolve();
};