// Conexión con la base de datos de mysql
import mysql from 'mysql2/promise'

const config = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'lahuella_db'
}

const connection = await mysql.createConnection(config)

export class newsletterModel {
  static async getAll () {
    const [newsletters] = await connection.query(
      'SELECT BIN_TO_UUID(id, true), email FROM newsletters;'
    )

    // Si no encuentra registros en la base de datos
    if (newsletters.length === 0) return []

    // return newsletters.map(newsletter => ({ ...newsletter, id: newsletter.id.toString('utf-8') }))

    return newsletters
  }

  async getById ({ id }) {
    const [newsletter] = await connection.query(
      'SELECT id, email FROM newsletters WHERE id = ?;', id
    )

    if (newsletter.length === 0) return null

    return newsletter
  }
}
