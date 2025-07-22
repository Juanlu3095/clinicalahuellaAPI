// Conexión con la base de datos de mysql para test por pool connection
import { pool } from '../config/dbconnection.js'

export class newsletterModel {
  static async getAll () {
    try {
      const [newsletters] = await pool.query(
        'SELECT HEX(id) as id, email, created_at FROM newsletters;'
      )

      // Si no encuentra registros en la base de datos
      if (newsletters.length === 0) return []

      return newsletters
    } catch (error) {
      console.error('Error en la consulta.', error)
    }
  }

  static async getById ({ id }) {
    try {
      const [newsletter] = await pool.execute(
        'SELECT HEX(id) as id, email FROM newsletters WHERE HEX(id) = ?;', [id]
      )

      if (newsletter.length === 0) return null

      return newsletter[0] // devolvemos un sólo elemento
    } catch (error) {
      console.error('Error en la consulta.', error)
    }
  }

  static async create ({ input }) {
    const { email } = input
    const [uuidResult] = await pool.query('SELECT UUID() uuid;') // Llamamos a mysql para que crea una uuid
    const [{ uuid }] = uuidResult // igualamos el resultado a uuid y con la desestructuración, sólo muestra el resultado
    try {
      const [newsletter] = await pool.execute(
        `INSERT INTO newsletters (id, email) VALUES (UUID_TO_BIN("${uuid}"), ?);`,
        [email])
      if (newsletter.affectedRows > 0) {
        return newsletter
      }
    } catch (error) {
      console.error('Error en la consulta.', error)
    }
  }

  static async update ({ id, input }) {
    const { email } = input
    const today = new Date() // Obtenemos la fecha de hoy
    const date = new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().slice(0, 19).replace('T', ' ') // Obtenemos la fecha en nuestra timezone en ISO

    try {
      const query = 'UPDATE newsletters SET email = ?, updated_at = ? WHERE HEX(id) = ?'
      const values = [email, date, id]

      const [result] = await pool.execute(query, values)
      if (result.affectedRows > 0) {
        return result
      }
    } catch (error) {
      console.error('Error en la consulta.', error)
    }
  }

  static async delete ({ id }) {
    try {
      const query = 'DELETE FROM newsletters WHERE HEX(id) = ?'
      const [result] = await pool.execute(query, [id])
      if (result.affectedRows > 0) {
        return result
      }
    } catch (error) {
      console.error('Error en la consulta.', error)
    }
  }

  static async deleteSelection ({ ids }) {
    try {
      const query = 'DELETE FROM newsletters WHERE HEX(id) IN (?)'
      const [result] = await pool.query(query, [ids])

      if (result.affectedRows > 0) {
        return result
      }
    } catch (error) {
      console.error('Error en la consulta: ', error)
    }
  }
}
