exports.seed = async function seed(knex) {
  const now = new Date().toISOString()
  await knex('refresh_tokens').del()
  await knex('refresh_tokens').insert([
    {
      id: 1,
      user_id: 1,
      refresh_token: '8e6112346a91d135e3cb8bbad7f5363eae2108ff',
      created_at: now,
      updated_at: now,
    },
    {
      id: 2,
      user_id: 1,
      refresh_token: 'dcb76e25b2079ee652d28f732f6679c441291d2e',
      created_at: '2020-01-01T11:12:06.585Z',
      updated_at: '2020-01-01T11:12:06.585Z',
    },
  ])
}
