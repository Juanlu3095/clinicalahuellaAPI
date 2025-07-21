// Conexión con la base de datos de mysql
import mysql from 'mysql2/promise'

export class DatabaseMigration {
  constructor ({ config }) {
    this.configuracion = config
  }

  // NO es static, ya que si lo fuera no puede acceder a this.configuracion. En ese caso habría que pasar config como parámetro
  async createDB () {
    const cloneconfig = { ...this.configuracion } // Clonamos el objeto this.configuracion con spread operator
    delete cloneconfig.database // Eliminamos la propiedad database del objeto clonado, no del original
    const connection = await mysql.createConnection(cloneconfig)

    try {
      const [db] = await connection.query(
        `CREATE DATABASE IF NOT EXISTS ${this.configuracion.database};` // La configuración de la DB viene desde mysql.js con this.configuracion
      )
      console.log('Base de datos creada con éxito.')
      return [db]
    } catch (error) {
      console.error('Error al crear la base de datos:', error)
    } finally {
      await connection.end()
    }
  }

  async deleteDB () {
    const connection = await mysql.createConnection(this.configuracion)

    try {
      const [db] = await connection.query(
        `DROP DATABASE IF EXISTS ${this.configuracion.database};`
      )
      console.log('Base de datos eliminada con éxito.')
      return [db]
    } catch (error) {
      console.error('Error al eliminar la base de datos:', error)
    } finally {
      await connection.end()
    }
  }
}
