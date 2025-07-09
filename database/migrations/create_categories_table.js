import mysql from 'mysql2/promise'

export class CategoryMigration {
  constructor ({ config }) {
    this.configuracion = config
  }

  // NO es static, ya que si lo fuera no puede acceder a this.configuracion. En ese caso habría que pasar config como parámetro
  async createCategories () {
    const connection = await mysql.createConnection(this.configuracion)
    try {
      const structure = `id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, nombre VARCHAR(50) NOT NULL, created_at TIMESTAMP DEFAULT(NOW()) NOT NULL,
                         updated_at TIMESTAMP DEFAULT(CURRENT_TIMESTAMP) NOT NULL`
      const [db] = await connection.query(
        `CREATE TABLE IF NOT EXISTS categories (${structure});`
      )
      console.log('Tabla categories creada con éxito.')
      return [db]
    } catch (error) {
      console.error('Error al crear la tabla de categories:', error)
    } finally {
      await connection.end()
    }
  }
}
