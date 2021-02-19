module.exports = {
  development: {
    client: 'postgresql',
    connection: {
      port: 5432,
      host: 'db',
      user: 'so',
      password: 'so',
      database: 'so',
    },
    pool: {
      min: 1,
      max: 10,
    },
  },
}
