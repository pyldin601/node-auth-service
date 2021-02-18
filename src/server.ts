import { createApp } from "./app"
import { Config } from "./config"
import { createKnexFromConfig } from "./knex"
import { logger } from "./logger"

const config = new Config(process.env)
const knex = createKnexFromConfig(config)

const app = createApp(config, knex, logger)

void (async (): Promise<void> => {
  const server = await new Promise((resolve, reject) => {
    const server = app.listen(config.port, () => {
      logger.debug(`Server is listening on port ${config.port}`)
      resolve(server)
    })
    app.on("error", error => reject(error))
  })

  // todo handle sigint, sigterm signals
  void server
})()
