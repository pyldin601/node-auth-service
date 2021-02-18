import * as Router from "koa-router"
import { Config } from "../config"
import { Knex } from "../knex"
import { createAccessToken } from "../utils/createAccessToken"
import { generateTokenForUser } from "../utils/generateTokenForUser"

function calculateExpirationThreshold(config: Config): string {
  const thresholdMillis = new Date().getTime() - config.refreshTokenLifeTime * 1000
  return new Date(thresholdMillis).toISOString()
}

export function postRefreshToken(config: Config, knex: Knex): Router.IMiddleware {
  return async (ctx): Promise<void> => {
    const { refresh_token: oldRefreshToken } = ctx.request.body

    if (!oldRefreshToken) {
      ctx.throw(400)
    }

    const newRefreshToken = await generateTokenForUser()
    const now = new Date().toISOString()

    const newAccessToken = await knex.transaction(async trx => {
      const threshold = calculateExpirationThreshold(config)

      const updatedRows = await trx("refresh_tokens")
        .update({ refresh_token: newRefreshToken, updated_at: now })
        .where("updated_at", ">", threshold)
        .where({ refresh_token: oldRefreshToken })
        .count<number>()

      if (updatedRows === 0) {
        ctx.throw(401)
      }

      const updatedRow = await trx("refresh_tokens")
        .where({ refresh_token: newRefreshToken })
        .first()

      return createAccessToken(config.tokenSecret, config.accessTokenLifetime, updatedRow.user_id)
    })

    ctx.body = {
      refresh_token: newRefreshToken,
      access_token: newAccessToken,
    }
  }
}
