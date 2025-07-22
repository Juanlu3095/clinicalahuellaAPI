// Conexión con la base de datos de mysql para test por pool connection
import { pool } from '../config/dbconnection.js'

export class bookingModel {
  static async getAll () {
    try {
      const [bookings] = await pool.query(
        'SELECT HEX(id) as id, nombre, apellidos, email, telefono, fecha, hora, created_at, updated_at FROM bookings;'
      )

      // Si no encuentra registros en la base de datos
      if (bookings.length === 0) return []

      return bookings
    } catch (error) {
      console.error('Error en la consulta.', error)
    }
  }

  static async getById ({ id }) {
    try {
      const [booking] = await pool.execute(
        'SELECT HEX(id) as id, nombre, apellidos, email, telefono, fecha, hora, created_at, updated_at FROM bookings WHERE HEX(id) = ?;', [id]
      )

      if (booking.length === 0) return null

      return booking
    } catch (error) {
      console.error('Error en la consulta.', error)
    }
  }

  static async create ({ input }) {
    const { nombre, apellidos, email, telefono, fecha, hora } = input
    const [uuidResult] = await pool.query('SELECT UUID() uuid;') // Llamamos a mysql para que crea una uuid
    const [{ uuid }] = uuidResult // igualamos el resultado a uuid y con la desestructuración, sólo muestra el resultado
    try {
      const [booking] = await pool.execute(
        `INSERT INTO bookings (id, nombre, apellidos, email, telefono, fecha, hora) VALUES (UUID_TO_BIN("${uuid}"), ?, ?, ?, ?, ?, ?);`,
        [nombre, apellidos, email, telefono, fecha, hora])
      if (booking.affectedRows > 0) {
        return booking
      }
    } catch (error) {
      console.error('Error en la consulta.', error)
    }
  }

  static async patch ({ id, input }) {
    const keys = Object.keys(input) // Obtenemos las propiedades de un objeto JS (input)
    const values = Object.values(input) // Obtenemos los valores de un objeto JS (input)
    const setKeys = keys.map(key => `${key} = ?`).join(', ') // Quedaría algo como SET nombre = ?, ... Usamos map para transformar

    const today = new Date() // Obtenemos la fecha de hoy
    const date = new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().slice(0, 19).replace('T', ' ') // Obtenemos la fecha en nuestra timezone en ISO

    // Comprobamos que haya a campos a actualizar
    if (keys.length === 0) {
      throw new Error('No hay campos a actualizar')
    }

    try {
      const query = `UPDATE bookings SET ${setKeys}, updated_at = ? WHERE HEX(id) = ?`
      const [result] = await pool.execute(query, [...values, date, id])
      if (result.affectedRows > 0) {
        return result
      }
    } catch (error) {
      console.error('Error en la consulta.', error)
    }
  }

  static async delete ({ id }) {
    try {
      const query = 'DELETE FROM bookings WHERE HEX(id) = ?'
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
      const query = 'DELETE FROM bookings WHERE HEX(id) IN (?)'
      const [result] = await pool.query(query, [ids])

      if (result.affectedRows > 0) {
        return result
      }
    } catch (error) {
      console.error('Error en la consulta: ', error)
    }
  }
}
