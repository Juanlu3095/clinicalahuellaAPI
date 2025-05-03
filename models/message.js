// Conexión con la base de datos de mysql por pool connection
import { pool } from '../pconnection.js'

export class messageModel {
  static async getAll () {
    try {
      const [messages] = await pool.query(
        'SELECT HEX(id) as id, nombre, apellidos, email, telefono, asunto, mensaje, created_at, updated_at FROM messages;'
      )

      // Si no encuentra registros en la base de datos
      if (messages.length === 0) return []

      return messages
    } catch (error) {
      console.error('Error en la consulta.', error)
    }
  }

  static async getById ({ id }) {
    try {
      const [message] = await pool.execute(
        'SELECT HEX(id) as id, nombre, apellidos, email, telefono, asunto, mensaje, created_at, updated_at FROM messages WHERE HEX(id) = ?;', [id]
      )

      if (!message) return null // no es message.length porque se devuelve un objeto y no un array

      return message[0] // devolvemos un objeto. Si se quita [0] se devuelve un array
    } catch (error) {
      console.error('Error en la consulta.', error)
    }
  }

  static async create ({ input }) {
    const { nombre, apellidos, email, telefono, asunto, mensaje } = input
    const [uuidResult] = await pool.query('SELECT UUID() uuid;') // Llamamos a mysql para que cree una uuid
    const [{ uuid }] = uuidResult // igualamos el resultado a uuid y con la desestructuración, sólo muestra el resultado
    try {
      const [message] = await pool.execute(
        `INSERT INTO messages (id, nombre, apellidos, email, telefono, asunto, mensaje) VALUES (UUID_TO_BIN("${uuid}"), ?, ?, ?, ?, ?, ?);`,
        [nombre, apellidos, email, telefono, asunto, mensaje])
      if (message.affectedRows > 0) {
        return message
      }
    } catch (error) {
      console.error('Error en la consulta.', error)
    }
  }

  static async update ({ id, input }) {
    const { nombre, apellidos, email, telefono, asunto, mensaje } = input
    const today = new Date() // Obtenemos la fecha de hoy
    const date = new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().slice(0, 19).replace('T', ' ') // Obtenemos la fecha en nuestra timezone en ISO

    try {
      const query = 'UPDATE messages SET nombre = ?, apellidos = ?, email = ?, telefono = ?, asunto = ?, mensaje = ?, updated_at = ? WHERE HEX(id) = ?'
      const values = [nombre, apellidos, email, telefono, asunto, mensaje, date, id]

      const [result] = await pool.execute(query, values)
      if (result.affectedRows > 0) {
        return result
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
      const query = `UPDATE messages SET ${setKeys}, updated_at = ? WHERE HEX(id) = ?`
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
      const query = 'DELETE FROM messages WHERE HEX(id) = ?'
      const [result] = await pool.execute(query, [id])
      if (result.affectedRows > 0) {
        return result
      }
    } catch (error) {
      console.error('Error en la consulta.', error)
    }
  }
}
