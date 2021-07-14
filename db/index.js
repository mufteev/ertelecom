const { Pool } = require('pg');
const db = new Pool({
  host    : process.env.DB_HOST,
  port    : process.env.DB_PORT,
  database: process.env.DB_DATABASE,
  user    : process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectionTimeoutMillis: 1000,
  idleTimeoutMillis: 300000,
});

function queryAsync(query, params) {
  return db.query(query, params);
}

module.exports = {
  queryAsync
};
