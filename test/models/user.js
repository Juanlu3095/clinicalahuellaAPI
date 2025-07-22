// Conexión con la base de datos de mysql para test por pool connection
import { pool } from '../config/dbconnection.js'

export class userModel {
  static async getUserByEmail ({ email }) {
    try {
      const [user] = await pool.query(
        'SELECT nombre, apellidos, password FROM users WHERE email = ?;', [email]
      )

      // Si no encuentra registros en la base de datos
      if (user.length === 0) return []
      return user[0]
    } catch (error) {
      console.error('Error en la consulta.', error)
    }
  }
}
