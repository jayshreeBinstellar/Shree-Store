const { Pool } = require("pg");

require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  port: process.env.DB_PORT,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

pool.query("SELECT 1")
  .then(() => console.log("Postgres connected"))
  .catch(err => console.error(err));

module.exports = pool;
