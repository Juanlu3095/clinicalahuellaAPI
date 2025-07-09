import mysql from 'mysql2/promise'

export class CategorySeeder {
  constructor ({ config }) {
    this.configuracion = config
  }

  async createcategory () {
    const connection = await mysql.createConnection(this.configuracion)
    const values = ['Perros', 'Gatos', 'Cuidado animal', 'Salud animal']
    let filasafectadas = 0

    try {
      const db = await Promise.all(
        values.map(async function (element) {
          const [result] = await connection.execute(
            'INSERT into categories (nombre) VALUES (?);', [element]
          )
          filasafectadas = filasafectadas + result.affectedRows
          return result
        })
      )
      console.log(`Categorías creadas con éxito. ${filasafectadas} fila(s) afectadas.`)
      return db
    } catch (error) {
      console.error('Error al crear las categorías:', error)
    } finally { // Con esto nos aseguramos de que siempre se cierre la conexión
      await connection.end()
    }
  }
}
