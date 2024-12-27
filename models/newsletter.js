// Conexión con la base de datos de mysql
import mysql from 'mysql2/promise'

const pool = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'lahuella_db',
  connectionLimit: 10
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

    try {
      const query = 'UPDATE newsletters SET email = ? WHERE HEX(id) = ?'
      const values = [email, id]
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
