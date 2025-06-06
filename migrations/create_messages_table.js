import mysql from 'mysql2/promise'

export class MessageMigration {
  constructor ({ config }) {
    this.configuracion = config
  }

  // NO es static, ya que si lo fuera no puede acceder a this.configuracion. En ese caso habría que pasar config como parámetro
  async createMessages () {
    const connection = await mysql.createConnection(this.configuracion)
    try {
      const structure = `id BINARY (16) PRIMARY KEY DEFAULT(UUID_TO_BIN(UUID())), nombre VARCHAR(100) NOT NULL, apellidos VARCHAR(100) NOT NULL, email VARCHAR(255) NOT NULL,
                         telefono INT NOT NULL, asunto VARCHAR(255) NOT NULL, mensaje VARCHAR(255) NOT NULL, created_at TIMESTAMP DEFAULT(NOW()) NOT NULL,
                         updated_at TIMESTAMP DEFAULT(CURRENT_TIMESTAMP) NOT NULL`
      const [db] = await connection.query(
        `CREATE TABLE IF NOT EXISTS messages (${structure});`
      )
      console.log('Tabla messages creada con éxito.')
      return [db]
    } catch (error) {
      console.error('Error al crear la tabla de messages:', error)
    } finally {
      await connection.end()
    }
  }
}
