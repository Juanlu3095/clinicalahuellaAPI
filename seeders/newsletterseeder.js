import mysql from 'mysql2/promise'

export class NewsletterSeeder {
  constructor ({ config }) {
    this.configuracion = config
  }

  async createnewsletter () {
    const connection = await mysql.createConnection(this.configuracion)
    const values = ['jdevtoday25@gmail.com', 'easyshop.notifications@gmail.com']
    let filasafectadas = 0

    try {
      const db = await Promise.all(
        values.map(async function (element) {
          const [result] = await connection.execute(
            'INSERT into newsletters (email) VALUES (?);', [element]
          )
          filasafectadas = filasafectadas + result.affectedRows
          return result
        })
      )
      console.log(`Newsletters creadas con éxito. ${filasafectadas} fila(s) afectadas.`)
      return db
    } catch (error) {
      console.error('Error al crear las newsletters:', error)
    } finally { // Con esto nos aseguramos de que siempre se cierre la conexión
      await connection.end()
    }
  }
}
