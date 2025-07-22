import mysql from 'mysql2/promise'

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_DATABASE_TEST, POOL_CONNECTIONLIMIT } = process.env

export const pool = mysql.createPool({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_DATABASE_TEST,
  connectionLimit: POOL_CONNECTIONLIMIT
})
