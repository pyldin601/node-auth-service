import { Knex } from './knex'
import { Config } from './config'
import Application from 'koa'
import * as t from 'io-ts'
import cors from '@koa/cors'
import Router, { RouterContext } from 'koa-router'
import { Server } from 'http'
import { isLeft } from 'fp-ts/Either'
import { Logger } from './logger'
import { requestLogger } from './requestLogger'
import bodyparser from 'koa-bodyparser'
import jwt from 'koa-jwt'
import { validate as isValidEmail } from 'email-validator'
import { compare, hash } from 'bcryptjs'
import { generateTokenForUser } from './utils/generateTokenForUser'
import { IRefreshTokensEntity, IUsersEntity, Table } from './entities'
import { createAccessToken } from './utils/createAccessToken'

const SignupRequestIO = t.type(
  {
    email: t.string,
    password: t.string,
  },
  'SignupRequestIO',
)

const LoginRequestIO = t.type(
  {
    email: t.string,
    password: t.string,
  },
  'LoginRequestIO',
)

const RefreshTokenRequestIO = t.type(
  {
    refresh_token: t.string,
  },
  'RefreshTokenRequestIO',
)

const ReleaseTokenRequestIO = t.type(
  {
    refresh_token: t.string,
  },
  'ReleaseTokenRequestIO',
)

export class HttpServer {
  readonly app: Application
  private server?: Server

  constructor(private config: Config, private knex: Knex, private logger: Logger) {
    const app = new Application()

    app.use((ctx, next) => {
      if (ctx.request.header['x-forwarded-method'] === 'OPTIONS') {
        ctx.method = 'OPTIONS'
      }

      return next()
    })

    app.use(requestLogger(logger))
    app.use(cors({ credentials: true, origin: config.allowedOrigin }))

    const router = new Router()

    router.get('/forward', jwt({ secret: config.tokenSecret }), this.forward)
    router.get('/user', jwt({ secret: config.tokenSecret }), this.getUser)

    router.post('/signup', bodyparser(), this.signup)
    router.post('/login', bodyparser(), this.login)
    router.post('/refreshToken', bodyparser(), this.refreshToken)
    router.post('/releaseToken', bodyparser(), this.releaseToken)

    app.use(router.routes())
    app.use(router.allowedMethods())

    this.app = app
  }

  public async listen(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server = this.app.listen(this.config.port, () => {
        this.logger.debug(`Server is listening on port ${this.config.port}`)
        resolve()
      })
      this.app.on('error', (error) => reject(error))
    })
  }

  public async shutdown(): Promise<void> {
    return new Promise((resolve, reject) =>
      this.server?.close((err) => (err ? reject(err) : resolve())),
    )
  }

  private forward = async (ctx: RouterContext): Promise<void> => {
    const { uid } = ctx.state.user

    ctx.set('user-id', uid)

    ctx.status = 200
  }

  private getUser = async (ctx: RouterContext): Promise<void> => {
    const { uid } = ctx.state.user

    const userDetails = await this.knex<IUsersEntity>(Table.Users).where({ id: uid }).first()

    if (!userDetails) {
      ctx.throw(401)
      return
    }

    ctx.body = {
      id: userDetails.id,
      email: userDetails.email,
    }
  }

  private signup = async (ctx: RouterContext): Promise<void> => {
    const request = SignupRequestIO.decode(ctx.request.body)

    if (isLeft(request)) {
      ctx.status = 400
      return
    }

    const { email, password } = request.right

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
      await this.knex<IUsersEntity>(Table.Users).insert({
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

  private login = async (ctx: RouterContext): Promise<void> => {
    const request = LoginRequestIO.decode(ctx.request.body)

    if (isLeft(request)) {
      ctx.status = 400
      return
    }

    const { email, password } = request.right

    if (!email || !password) {
      ctx.throw(400)
    }

    const user = await this.knex<IUsersEntity>(Table.Users).where({ email }).first()

    if (!user) {
      ctx.throw(401)
    }

    const arePasswordsEqual = await compare(password, user.password)

    if (!arePasswordsEqual) {
      ctx.throw(401)
    }

    const refreshToken = await generateTokenForUser()
    const now = new Date().toISOString()

    await this.knex<IRefreshTokensEntity>(Table.RefreshTokens).insert({
      user_id: user.id,
      refresh_token: refreshToken,
      created_at: now,
      updated_at: now,
    })

    const accessToken = await createAccessToken(
      this.config.tokenSecret,
      this.config.accessTokenLifetime,
      user.id,
    )

    ctx.body = {
      access_token: accessToken,
      refresh_token: refreshToken,
    }
  }

  private refreshToken = async (ctx: RouterContext): Promise<void> => {
    const request = RefreshTokenRequestIO.decode(ctx.request.body)

    if (isLeft(request)) {
      ctx.status = 400
      return
    }

    const { refresh_token: oldRefreshToken } = request.right

    if (!oldRefreshToken) {
      ctx.throw(400)
    }

    const newRefreshToken = await generateTokenForUser()
    const now = new Date().toISOString()

    const newAccessToken = await this.knex.transaction(async (trx) => {
      const threshold = this.calculateExpirationThreshold()

      const updatedRows = await trx<IRefreshTokensEntity>(Table.RefreshTokens)
        .update({ refresh_token: newRefreshToken, updated_at: now })
        .where('updated_at', '>', threshold)
        .where({ refresh_token: oldRefreshToken })
        .count<number>()

      if (updatedRows === 0) {
        ctx.throw(401)
      }

      const updatedRow = await trx(Table.RefreshTokens)
        .where({ refresh_token: newRefreshToken })
        .first()

      return createAccessToken(
        this.config.tokenSecret,
        this.config.accessTokenLifetime,
        updatedRow.user_id,
      )
    })

    ctx.body = {
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
    }
  }

  private releaseToken = async (ctx: RouterContext): Promise<void> => {
    const request = ReleaseTokenRequestIO.decode(ctx.request.body)

    if (isLeft(request)) {
      ctx.status = 400
      return
    }

    const { refresh_token } = request.right

    if (!refresh_token) {
      ctx.throw(400)
    }

    const deletedRows = await this.knex<IRefreshTokensEntity>(Table.RefreshTokens)
      .where({ refresh_token })
      .delete()
      .count<number>()

    if (deletedRows === 0) {
      ctx.throw(401)
    }

    ctx.status = 200
  }

  private calculateExpirationThreshold = (): string => {
    const thresholdMillis = new Date().getTime() - this.config.refreshTokenLifetime * 1000
    return new Date(thresholdMillis).toISOString()
  }
}
