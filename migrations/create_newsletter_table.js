// Conexión con la base de datos de mysql
import mysql from 'mysql2/promise'

export class NewsletterMigration {
  constructor ({ config }) {
    this.configuracion = config
  }

  // NO es static, ya que si lo fuera no puede acceder a this.configuracion. En ese caso habría que pasar config como parámetro
  async createNewsletters () {
    const connection = await mysql.createConnection(this.configuracion)
    try {
      const structure = 'id BINARY (16) PRIMARY KEY DEFAULT(UUID()), email VARCHAR(255) NOT NULL'
      const [db] = await connection.query(
        `CREATE TABLE IF NOT EXISTS newsletters (${structure});`
      )
      console.log('Tabla newsletters creada con éxito.')
      return [db]
    } catch (error) {
      console.error('Error al crear la tabla de newsletters:', error)
    } finally {
      await connection.end()
    }
  }
}
