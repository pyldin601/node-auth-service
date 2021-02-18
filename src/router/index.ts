import bodyparser = require("koa-bodyparser")
import jwt = require("koa-jwt")
import Router = require("koa-router")

import { Config } from "../config"
import { Knex } from "../knex"
import { getMe } from "./getMe"
import { postForgotToken } from "./postForgotToken"
import { postLogin } from "./postLogin"
import { postRefreshToken } from "./postRefreshToken"
import { postSignup } from "./postSignup"

export function createRouter(config: Config, knex: Knex): Router {
  const router = new Router()

  router.post("/signup", bodyparser(), postSignup(config, knex))
  router.post("/login", bodyparser(), postLogin(config, knex))
  router.post("/refreshToken", bodyparser(), postRefreshToken(config, knex))
  router.post("/forgotToken", bodyparser(), postForgotToken(config, knex))
  router.get("/me", jwt({ secret: config.tokenSecret }), getMe(config, knex))

  return router
}
