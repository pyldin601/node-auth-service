exports.up = function up(knex) {
  return knex.schema.createTable("users", table => {
    table.increments();
    table.string("email").notNullable();
    table.string("password").notNullable();
    table.timestamps();

    table.unique(["email"]);
  });
};

exports.down = function down(knex) {
  return knex.schema.dropTable("users");
};
