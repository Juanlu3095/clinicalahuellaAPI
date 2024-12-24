// Conexión con la base de datos de mysql
import mysql from 'mysql2/promise'

export class DatabaseMigration {
  constructor ({ config }) {
    this.configuracion = config
  }

  // NO es static, ya que si lo fuera no puede acceder a this.configuracion. En ese caso habría que pasar config como parámetro
  async createDB () {
    const connection = await mysql.createConnection(this.configuracion)

    try {
      const [db] = await connection.query(
        'CREATE DATABASE IF NOT EXISTS `lahuella_db`;'
      )
      console.log('Base de datos creada con éxito.')
      return [db]
    } catch (error) {
      console.error('Error al crear la base de datos:', error)
    } finally {
      await connection.end()
    }
  }
}