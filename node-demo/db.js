const { Pool } = require("pg");
;
const pool = new Pool({
  host: "localhost",
  user: "postgres",
  port: 5432,
  password: "Btpl@dev",
  database: "postgres",
});

pool.query("SELECT 1")
  .then(() => console.log("Postgres connected"))
  .catch(err => console.error(err));

module.exports = pool;
