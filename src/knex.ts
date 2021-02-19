import { Config } from './config'
import knex = require('knex')

export type Knex = knex

export function createKnexFromConfig(config: Config): Knex {
  return knex({
    connection: config.databaseUrl,
    client: config.databaseClient,
    pool: { min: 0, max: 10 },
  })
}
