import mysql from 'mysql2/promise'

export class ImageMigration {
  constructor ({ config }) {
    this.configuracion = config
  }

  // NO es static, ya que si lo fuera no puede acceder a this.configuracion. En ese caso habría que pasar config como parámetro
  async createImages () {
    const connection = await mysql.createConnection(this.configuracion)
    try {
      const structure = `id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, nombre VARCHAR(100) NOT NULL, alt VARCHAR(100) NOT NULL, image_url VARCHAR(100) NOT NULL,
                         created_at TIMESTAMP DEFAULT(NOW()) NOT NULL, updated_at TIMESTAMP DEFAULT(CURRENT_TIMESTAMP) NOT NULL`
      const [db] = await connection.query(
        `CREATE TABLE IF NOT EXISTS images (${structure});`
      )
      console.log('Tabla images creada con éxito.')
      return [db]
    } catch (error) {
      console.error('Error al crear la tabla de images:', error)
    } finally {
      await connection.end()
    }
  }
}
