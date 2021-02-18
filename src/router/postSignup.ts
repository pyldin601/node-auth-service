import { hash } from "bcryptjs"
import { validate as isValidEmail } from "email-validator"
import * as Router from "koa-router"
import { Config } from "../config"
import { Knex } from "../knex"

export function postSignup(config: Config, knex: Knex): Router.IMiddleware {
  void config

  return async (ctx): Promise<void> => {
    const { email, password } = ctx.request.body

    if (!email || !password) {
      ctx.throw(400)
    }

    if (password.length < 6) {
      ctx.throw(400)
    }

    if (!isValidEmail(email)) {
      ctx.throw(400)
    }

    const passwordHash = await hash(password, 10)
    const now = new Date().toISOString()

    try {
      await knex("users").insert({
        email,
        password: passwordHash,
        created_at: now,
        updated_at: now,
      })

      ctx.status = 200
    } catch (e) {
      if (e.message.match(/constraint/)) {
        ctx.status = 409
      } else {
        throw e
      }
    }
  }
}
