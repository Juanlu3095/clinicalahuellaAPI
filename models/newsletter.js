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
      'SELECT HEX(id) as id, email FROM newsletters;'
    )

    // Si no encuentra registros en la base de datos
    if (newsletters.length === 0) return []

    // return newsletters.map(newsletter => ({ ...newsletter, id: newsletter.id.toString('utf-8') }))

    return newsletters
  }

  static async getById ({ id }) {
    try {
      const [newsletter] = await connection.query(
        'SELECT HEX(id) as id, email FROM newsletters WHERE HEX(id) = ?;', id
      )

      if (newsletter.length === 0) return null

      return newsletter
    } catch (error) {
      console.error('Error en la consulta', error)
    } finally {
      await connection.end()
    }
  }
}
