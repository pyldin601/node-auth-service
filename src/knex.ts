import * as knex from 'knex'
import { Config } from './config'

export type Knex = knex

export function createKnexFromConfig(config: Config): Knex {
  return knex({
    connection: config.databaseUrl,
    client: config.databaseClient,
    pool: { min: 0, max: 10 },
  })
}
