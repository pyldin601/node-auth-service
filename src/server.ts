import { Config } from './config'
import { createKnexFromConfig } from './knex'
import { logger } from './logger'
import { HttpServer } from './HttpServer'

async function main(): Promise<void> {
  const config = new Config(process.env)
  const knex = createKnexFromConfig(config)
  const server = new HttpServer(config, knex, logger)

  logger.debug(`Server is listening on port ${config.port}`)
  await server.listen()
}

main().catch((error) => {
  logger.error(error)
  process.exit(1)
})
