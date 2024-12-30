import mysql from 'mysql2/promise'
import 'dotenv/config'

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_DATABASE, POOL_CONNECTIONLIMIT } = process.env

export const pool = mysql.createPool({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  connectionLimit: POOL_CONNECTIONLIMIT
})
