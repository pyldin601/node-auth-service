export class Config {
  readonly port: number
  readonly allowedOrigin: string
  readonly refreshTokenLifetime: number
  readonly accessTokenLifetime: number
  readonly databaseUrl: string
  readonly databaseClient: string
  readonly tokenSecret: string

  constructor(env: { [key: string]: string | undefined }) {
    this.port = env.PORT ? parseInt(env.PORT, 10) : 8080

    if (!env.ALLOWED_ORIGIN) {
      throw new Error('Environment variable ALLOWED_ORIGIN is required')
    }

    this.allowedOrigin = env.ALLOWED_ORIGIN

    if (!env.REFRESH_TOKEN_LIFETIME) {
      throw new Error('Environment variable REFRESH_TOKEN_LIFETIME is required')
    }

    this.refreshTokenLifetime = parseInt(env.REFRESH_TOKEN_LIFETIME, 10)

    if (!env.ACCESS_TOKEN_LIFETIME) {
      throw new Error('Environment variable ACCESS_TOKEN_LIFETIME is required')
    }

    this.accessTokenLifetime = parseInt(env.ACCESS_TOKEN_LIFETIME, 10)

    if (!env.DATABASE_URL) {
      throw new Error('Environment variable DATABASE_URL is required')
    }

    this.databaseUrl = env.DATABASE_URL

    if (!env.DATABASE_CLIENT) {
      throw new Error('Environment variable DATABASE_CLIENT is required')
    }

    this.databaseClient = env.DATABASE_CLIENT

    if (!env.TOKEN_SECRET) {
      throw new Error('Environment variable TOKEN_SECRET is required')
    }

    this.tokenSecret = env.TOKEN_SECRET
  }
}
