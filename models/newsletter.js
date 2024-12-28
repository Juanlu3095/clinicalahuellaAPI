// Conexión con la base de datos de mysql
import mysql from 'mysql2/promise'
import 'dotenv/config'

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_DATABASE, POOL_CONNECTIONLIMIT } = process.env

const pool = mysql.createPool({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  connectionLimit: POOL_CONNECTIONLIMIT
})

/* pool.connect()
  .then(() => { console.log('Conexión establecida con la base de datos') })
  .catch(error => { console.error('Error al establecer la conexión con la base de datos.', error) }) */

export class newsletterModel {
  static async getAll () {
    try {
      const [newsletters] = await pool.query(
        'SELECT HEX(id) as id, email FROM newsletters;'
      )

      // Si no encuentra registros en la base de datos
      if (newsletters.length === 0) return []

      return newsletters
    } catch (error) {
      console.error('Error en la consulta.', error)
    } finally {
      pool.releaseConnection()
    }
  }

  static async getById ({ id }) {
    try {
      const [newsletter] = await pool.query(
        'SELECT HEX(id) as id, email FROM newsletters WHERE HEX(id) = ?;', id
      )

      if (newsletter.length === 0) return null

      return newsletter
    } catch (error) {
      console.error('Error en la consulta.', error)
    } finally {
      pool.releaseConnection()
    }
  }

  static async create ({ input }) {
    const { email } = input
    const [uuidResult] = await pool.query('SELECT UUID() uuid;') // Llamamos al mysql para que crea una uuid
    const [{ uuid }] = uuidResult // igualamos el resultado a uuid y con la desestructuración, sólo muestra el resultado
    try {
      const [newsletter] = await pool.query(
        `INSERT INTO newsletters (id, email) VALUES (UUID_TO_BIN("${uuid}"), ?);`,
        [email])
      if (newsletter.affectedRows > 0) {
        return newsletter
      }
    } catch (error) {
      console.error('Error en la consulta.', error)
    } finally {
      pool.releaseConnection()
    }
  }

  static async update ({ id, input }) {
    const { email } = input
    const today = new Date() // Obtenemos la fecha de hoy
    const date = new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().slice(0, 19).replace('T', ' ') // Obtenemos la fecha en nuestra timezone en ISO

    try {
      const query = 'UPDATE newsletters SET email = ?, updated_at = ? WHERE HEX(id) = ?'
      const values = [email, date, id]
      /* const [result, fields] = await connection.query(
        `UPDATE newsletters SET 'email' VALUES (?) WHERE HEX(id) = ${id};`,
        email
      ) */
      const [result] = await pool.query(query, values)
      if (result.affectedRows > 0) {
        return result
      }
    } catch (error) {
      console.error('Error en la consulta.', error)
    } finally {
      pool.releaseConnection()
    }
  }

  static async delete ({ id }) {
    try {
      const query = 'DELETE FROM newsletters WHERE HEX(id) = ?'
      const [result] = await pool.query(query, id)
      if (result.affectedRows > 0) {
        return result
      }
    } catch (error) {
      console.error('Error en la consulta.', error)
    } finally {
      pool.releaseConnection()
    }
  }
}
