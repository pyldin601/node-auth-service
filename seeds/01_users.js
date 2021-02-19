exports.seed = async function seed(knex) {
  await knex("users").del()
  await knex("users").insert([
    {
      id: 1,
      email: "foo@bar.baz",
      password: "$2a$10$8J.o/lvmIv9.4HckFySGuegUchg41rjTzWjiydO6ji9Qd5YixyoTa",
      created_at: "2020-02-09T11:12:06.585Z",
      updated_at: "2020-02-09T11:12:06.585Z",
    },
    {
      id: 2,
      email: "bass@bar.baz",
      password: "$2a$10$8J.o/lvmIv9.4HckFySGuegUchg41rjTzWjiydO6ji9Qd5YixyoTa",
      created_at: "2020-02-09T11:12:06.585Z",
      updated_at: "2020-02-09T11:12:06.585Z",
    },
  ])
}
