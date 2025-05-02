declare module './knexfile.js' {
  import { Knex } from 'knex';
  const config: Knex.Config;
  export default config;
}