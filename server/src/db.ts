import knex from 'knex';
// @ts-ignore
import config from '../knexfile.js';

const db = knex(config);
export default db;
