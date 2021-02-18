export class Config {
  readonly port: number
  readonly allowedOrigin: string
  readonly refreshTokenLifeTime: number
  readonly accessTokenLifetime: number
  readonly databaseUrl: string
  readonly databaseClient: string
  readonly tokenSecret: string

  constructor(env: { [key: string]: string | undefined }) {
    this.port = env.PORT ? parseInt(env.PORT, 10) : 8080

    if (!env.AUTH_SERVER_ALLOWED_ORIGIN) {
      throw new Error("Environment variable AUTH_SERVER_ALLOWED_ORIGIN is required")
    }

    this.allowedOrigin = env.AUTH_SERVER_ALLOWED_ORIGIN

    if (!env.AUTH_SERVER_REFRESH_TOKEN_LIFETIME) {
      throw new Error("Environment variable AUTH_SERVER_REFRESH_TOKEN_LIFETIME is required")
    }

    this.refreshTokenLifeTime = parseInt(env.AUTH_SERVER_REFRESH_TOKEN_LIFETIME, 10)

    if (!env.AUTH_SERVER_ACCESS_TOKEN_LIFETIME) {
      throw new Error("Environment variable AUTH_SERVER_ACCESS_TOKEN_LIFETIME is required")
    }

    this.accessTokenLifetime = parseInt(env.AUTH_SERVER_ACCESS_TOKEN_LIFETIME, 10)

    if (!env.AUTH_SERVER_DATABASE_URL) {
      throw new Error("Environment variable AUTH_SERVER_DATABASE_URL is required")
    }

    this.databaseUrl = env.AUTH_SERVER_DATABASE_URL

    if (!env.AUTH_SERVER_DATABASE_CLIENT) {
      throw new Error("Environment variable AUTH_SERVER_DATABASE_CLIENT is required")
    }

    this.databaseClient = env.AUTH_SERVER_DATABASE_CLIENT

    if (!env.AUTH_SERVER_TOKEN_SECRET) {
      throw new Error("Environment variable AUTH_SERVER_TOKEN_SECRET is required")
    }

    this.tokenSecret = env.AUTH_SERVER_TOKEN_SECRET
  }
}
