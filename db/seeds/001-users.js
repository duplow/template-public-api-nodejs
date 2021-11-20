
exports.seed = function(knex) {
  return knex('user').del()
    .then(function () {
      return knex('user').insert([
        {
          id: "2d7232f6-44b1-48bf-b1d9-3b188961ee45",
          username: "admin",
          password: "admin"
        },
        {
          id: "57eb4bc0-9957-483b-82a8-be5f5c8140d2",
          username: "tester",
          password: "tester"
        }
      ]);
    });
};