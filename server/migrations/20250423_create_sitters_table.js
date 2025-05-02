/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('sitters', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('photo_url').notNullable();
    table.decimal('rate', 8, 2).notNullable();
    table.decimal('rating', 3, 1).notNullable();
    table.integer('review_count').defaultTo(0);
    table.integer('repeat_client_count').defaultTo(0);
    table.string('location').notNullable();
    table.decimal('latitude', 9, 6).notNullable();
    table.decimal('longitude', 9, 6).notNullable();
    table.string('address').notNullable(); 
    table.boolean('verified').defaultTo(false);
    table.boolean('top_sitter').defaultTo(false);
    table.timestamp('availability_updated_at').defaultTo(knex.fn.now());
    table.json('services').notNullable(); 
    table.json('pet_types').notNullable(); 
    table.json('dog_sizes').nullable(); 
    table.json('certifications').nullable(); 
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('sitters');
};