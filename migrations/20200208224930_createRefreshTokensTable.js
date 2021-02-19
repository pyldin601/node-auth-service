exports.up = function up(knex) {
  return knex.schema.createTable('refresh_tokens', (table) => {
    table.increments()
    table.integer('user_id').references('users.id').notNullable()
    table.string('refresh_token').notNullable()
    table.timestamps()

    table.unique(['refresh_token'])
  })
}

exports.down = function down(knex) {
  return knex.schema.dropTable('refresh_tokens')
}
