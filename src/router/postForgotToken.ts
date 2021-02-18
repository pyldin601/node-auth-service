import { entities } from "@myownradio/shared-server"
import * as Router from "koa-router"
import { Config } from "../config"
import { Knex } from "../knex"

export function postForgotToken(config: Config, knex: Knex): Router.IMiddleware {
  void config

  return async (ctx): Promise<void> => {
    const { refresh_token } = ctx.request.body

    if (!refresh_token) {
      ctx.throw(400)
    }

    const deletedRows = await knex<entities.IRefreshTokensEntity>(entities.TableName.RefreshTokens)
      .where({ refresh_token })
      .delete()
      .count<number>()

    if (deletedRows === 0) {
      ctx.throw(401)
    }

    ctx.status = 200
  }
}
