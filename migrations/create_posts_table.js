import mysql from 'mysql2/promise'

export class PostMigration {
  constructor ({ config }) {
    this.configuracion = config
  }

  // NO es static, ya que si lo fuera no puede acceder a this.configuracion. En ese caso habría que pasar config como parámetro
  async createPosts () {
    const connection = await mysql.createConnection(this.configuracion)
    try {
      const structure = `id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, slug VARCHAR(100) UNIQUE NOT NULL, titulo VARCHAR(100) NOT NULL,
                         contenido TEXT NOT NULL, categoriaId INT UNSIGNED, imagen INT UNSIGNED, metadescription VARCHAR(200) NOT NULL,
                         keywords VARCHAR(200), estado enum('publicado', 'borrador') DEFAULT 'borrador',
                         created_at TIMESTAMP DEFAULT(NOW()) NOT NULL, updated_at TIMESTAMP DEFAULT(CURRENT_TIMESTAMP) NOT NULL`
      const [db] = await connection.query(
        `CREATE TABLE IF NOT EXISTS posts (${structure});`
      )
      console.log('Tabla posts creada con éxito.')
      return [db]
    } catch (error) {
      console.error('Error al crear la tabla de posts:', error)
    } finally {
      await connection.end()
    }
  }
}
