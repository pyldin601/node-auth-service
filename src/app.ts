import cors = require("@koa/cors")
import Application = require("koa")
import { Config } from "./config"
import { Knex } from "./knex"
import { Logger } from "./logger"
import { createRouter } from "./router"
import {requestLogger} from "./requestLogger";


export function createApp(config: Config, knex: Knex, logger: Logger): Application {
  const app = new Application()
  const router = createRouter(config, knex)

  app.use(requestLogger(logger))
  app.use(cors({ credentials: true, origin: config.allowedOrigin }))

  app.use(router.routes())
  app.use(router.allowedMethods())

  return app
}
