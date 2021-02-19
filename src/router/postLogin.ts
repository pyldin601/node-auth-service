import { compare } from 'bcryptjs'
import * as Router from 'koa-router'
import { Config } from '../config'
import { Knex } from '../knex'

import { createAccessToken } from '../utils/createAccessToken'
import { generateTokenForUser } from '../utils/generateTokenForUser'
import { IRefreshTokensEntity, Table } from '../entities'

export function postLogin(config: Config, knex: Knex): Router.IMiddleware {
  return async (ctx): Promise<void> => {
    const { email, password } = ctx.request.body

    if (!email || !password) {
      ctx.throw(400)
    }

    const user = await knex('users').where({ email }).first()

    if (!user) {
      ctx.throw(401)
    }

    const arePasswordsEqual = await compare(password, user.password)

    if (!arePasswordsEqual) {
      ctx.throw(401)
    }

    const refreshToken = await generateTokenForUser()
    const now = new Date().toISOString()

    await knex<IRefreshTokensEntity>(Table.RefreshTokens).insert({
      user_id: user.id,
      refresh_token: refreshToken,
      created_at: now,
      updated_at: now,
    })

    const accessToken = await createAccessToken(
      config.tokenSecret,
      config.accessTokenLifetime,
      user.id,
    )

    ctx.body = {
      refresh_token: refreshToken,
      access_token: accessToken,
    }
  }
}
