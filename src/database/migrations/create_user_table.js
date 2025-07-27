import mysql from 'mysql2/promise'

export class UserMigration {
  constructor ({ config }) {
    this.configuracion = config
  }

  // NO es static, ya que si lo fuera no puede acceder a this.configuracion. En ese caso habría que pasar config como parámetro
  async createUsers () {
    const connection = await mysql.createConnection(this.configuracion)
    try {
      const structure = `id BINARY (16) PRIMARY KEY DEFAULT(UUID_TO_BIN(UUID())), nombre VARCHAR(100) NOT NULL, apellidos VARCHAR(100) NOT NULL, email VARCHAR(100) UNIQUE NOT NULL,
                        password VARCHAR(255) NOT NULL, created_at TIMESTAMP DEFAULT(NOW()) NOT NULL, updated_at TIMESTAMP DEFAULT(CURRENT_TIMESTAMP) NOT NULL`
      const [db] = await connection.query(
        `CREATE TABLE IF NOT EXISTS users (${structure});`
      )
      console.log('Tabla users creada con éxito.')
      return [db]
    } catch (error) {
      console.error('Error al crear la tabla de users:', error)
    } finally {
      await connection.end()
    }
  }
}
