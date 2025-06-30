import 'dotenv/config'
import bcrypt from 'bcrypt'
import mysql from 'mysql2/promise'

const { FIRST_USER_PASS, FIRST_USER_EMAIL, BSALT } = process.env

export class UserSeeder {
  constructor ({ config }) {
    this.configuracion = config
  }

  async createuser () {
    const connection = await mysql.createConnection(this.configuracion)
    const hashedPassword = bcrypt.hashSync(FIRST_USER_PASS, parseInt(BSALT))
    const values = ['Juan', 'Dev', FIRST_USER_EMAIL, hashedPassword]

    try {
      const [result] = await connection.execute(
        'INSERT into users (nombre, apellidos, email, password) VALUES (?, ?, ?, ?);',
        [...values] // Necesitamos el spread operator para convertir el array en valores individuales para que puedan sustituirse por los ? de la consulta
      )
      console.log(`Usuario creado con éxito. ${result.affectedRows} fila(s) afectadas.`)
      return result
    } catch (error) {
      console.error('Error al crear el usuario:', error)
    } finally { // Con esto nos aseguramos de que siempre se cierre la conexión
      await connection.end()
    }
  }
}
