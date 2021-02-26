import { createLogger } from 'winston'
import { Config } from '../src/config'
import { Knex } from '../src/knex'
import { Logger } from '../src/logger'
import { HttpServer } from '../src/HttpServer'
import knex = require('knex')
import supertest = require('supertest')

const migrationsDir = `${__dirname}/../migrations`
const seedsDir = `${__dirname}/../seeds`

const accessToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjEsImlhdCI6MTUxNjIzOTAyMn0.Fknsf_nSFNdqS9JkFJABEEtMVffv9zR1_nrI2mAVx60'

const config = new Config({
  TOKEN_SECRET: 'secret',
  DATABASE_URL: ':memory:',
  DATABASE_CLIENT: 'sqlite3',
  ACCESS_TOKEN_LIFETIME: '30',
  REFRESH_TOKEN_LIFETIME: '2592000',
  ALLOWED_ORIGIN: '*',
  PORT: '8080',
})

let request: supertest.SuperTest<supertest.Test>
let knexConnection: Knex
let logger: Logger

beforeEach(async () => {
  logger = createLogger({
    silent: true,
  })

  knexConnection = knex({
    connection: config.databaseUrl,
    client: config.databaseClient,
    useNullAsDefault: false,
  })

  await knexConnection.migrate.latest({
    directory: migrationsDir,
  })

  await knexConnection.seed.run({
    directory: seedsDir,
  })

  request = supertest(new HttpServer(config, knexConnection, logger).app.callback())
})

describe('on POST /signup', () => {
  test('should fail with 400 if no email specified', async () => {
    await request.post('/signup').send({ password: 'somepassword' }).expect(400)
  })

  test('should fail with 400 if email is not invalid', async () => {
    await request
      .post('/signup')
      .send({ email: 'invalid_email', password: 'somepassword' })
      .expect(400)
  })

  test('should fail with 400 if no password specified', async () => {
    await request.post('/signup').send({ email: 'someone@mail.com' }).expect(400)
  })

  test('should fail with 400 if password is too short', async () => {
    await request.post('/signup').send({ email: 'someone@mail.com', password: 'short' }).expect(400)
  })

  test('should fail with 400 when request body is empty', async () => {
    await request.post('/signup').expect(400)
  })

  test('should fail with 409 if email already used by someone else', async () => {
    await request
      .post('/signup')
      .send({ email: 'foo@bar.baz', password: 'somepassword' })
      .expect(409)
  })

  test('should create user', async () => {
    await request
      .post('/signup')
      .send({ email: 'someone@mail.com', password: 'somepassword' })
      .expect(200)

    await expect(
      knexConnection('users').where({ email: 'someone@mail.com' }).first(),
    ).resolves.toEqual({
      id: expect.any(Number),
      email: 'someone@mail.com',
      password: expect.any(String),
      created_at: expect.any(String),
      updated_at: expect.any(String),
    })
  })
})

describe('/login', () => {
  test('POST /login - should respond with authorization data', async () => {
    const response = await request
      .post('/login')
      .send({ email: 'foo@bar.baz', password: 'somepassword' })

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      refresh_token: expect.any(String),
      access_token: expect.any(String),
    })

    await expect(knexConnection('refresh_tokens').where({ user_id: 1 }).first()).resolves.toEqual({
      id: expect.any(Number),
      user_id: 1,
      refresh_token: expect.any(String),
      created_at: expect.any(String),
      updated_at: expect.any(String),
    })
  })

  test('POST /login - should fail if email or password not specified', async () => {
    await request.post('/login').expect(400)
  })

  test("POST /login - should fail if email or password aren't correct", async () => {
    await request.post('/login').send({ email: 'foo@bar.baz', password: 'wrong' }).expect(401)

    await request.post('/login').send({ email: 'wrong@bar.baz', password: 'wrong' }).expect(401)
  })
})

describe('/refreshToken', () => {
  test('POST /refreshToken - should update refresh token and create new access token', async () => {
    const response = await request
      .post('/refreshToken')
      .send({ refresh_token: '8e6112346a91d135e3cb8bbad7f5363eae2108ff' })

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      refresh_token: expect.any(String),
      access_token: expect.any(String),
    })
  })

  test('POST /refreshToken - refresh token should be used only once', async () => {
    await request
      .post('/refreshToken')
      .send({ refresh_token: '8e6112346a91d135e3cb8bbad7f5363eae2108ff' })
      .expect(200)

    await request
      .post('/refreshToken')
      .send({ refresh_token: '8e6112346a91d135e3cb8bbad7f5363eae2108ff' })
      .expect(401)
  })

  test("POST /refreshToken - should fail if refresh token isn't valid", async () => {
    await request.post('/refreshToken').send({ refresh_token: 'invalid token' }).expect(401)
  })

  test("POST /refreshToken - should fail if refresh token isn't specified", async () => {
    await request.post('/refreshToken').expect(400)
  })

  test('POST /refreshToken - should fail if refresh token is expired', async () => {
    await request
      .post('/refreshToken')
      .send({ refresh_token: 'dcb76e25b2079ee652d28f732f6679c441291d2e' })
      .expect(401)
  })
})

describe('/forward', () => {
  test('GET /forward - should get authorized user details', async () => {
    await request
      .get('/forward')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect('user-id', '1')
  })

  test('GET /forward - should fail if unauthorized', async () => {
    await request.get('/forward').expect(401)
  })

  test('GET /forward - should fail if authorization is wrong', async () => {
    await request.get('/forward').set('Authorization', 'Bearer Wrong').expect(401)
  })
})

describe('POST /forgotToken', () => {
  it('should respond with 200 if success', async () => {
    await request
      .post('/forgotToken')
      .send({ refresh_token: '8e6112346a91d135e3cb8bbad7f5363eae2108ff' })
      .expect(200)
  })

  it('should respond with 400 if no refresh token specified', async () => {
    await request.post('/forgotToken').expect(400)
  })

  it('should respond with 401 if refresh token is not valid', async () => {
    await request.post('/forgotToken').send({ refresh_token: 'invalid_refresh_token' }).expect(401)
  })
})
