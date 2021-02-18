import { entities } from "@myownradio/shared-server"
import { Middleware } from "koa"
import { Config } from "../config"
import { Knex } from "../knex"

export function getMe(config: Config, knex: Knex): Middleware {
  void config

  return async (ctx): Promise<void> => {
    // todo explicitly decode state
    const { uid } = ctx.state.user

    const userDetails = await knex<entities.IUsersEntity>(entities.TableName.Users)
      .where({ id: uid })
      .first()

    if (!userDetails) {
      ctx.throw(401)
      return
    }

    ctx.body = {
      email: userDetails.email,
    }
  }
}
