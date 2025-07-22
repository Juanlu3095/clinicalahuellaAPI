import mysql from 'mysql2/promise'

export class MessageSeeder {
  constructor ({ config }) {
    this.configuracion = config
  }

  async createmessage () {
    const connection = await mysql.createConnection(this.configuracion)
    const values = [
      {
        nombre: 'José',
        apellidos: 'González',
        email: 'jgonzalez@gmail.com',
        telefono: '958741123',
        asunto: 'Hola soy José',
        mensaje: 'Este es el mensaje creado de José.'
      },
      {
        nombre: 'Jacinto',
        apellidos: 'Pérez',
        email: 'jperez@gmail.com',
        telefono: '987456321',
        asunto: 'Hola soy Jacinto',
        mensaje: 'Este es el mensaje creado de Jacinto.'
      },
      {
        nombre: 'Manuela',
        apellidos: 'Tena',
        email: 'mtena@gmail.com',
        telefono: '951474111',
        asunto: 'Hola soy Manuela',
        mensaje: 'Este es el mensaje creado de Manuela.'
      }
    ]
    let filasafectadas = 0

    try {
      const db = await Promise.all(
        values.map(async function (element) {
          const values = Object.values(element)
          const [result] = await connection.execute(
            'INSERT into messages (nombre, apellidos, email, telefono, asunto, mensaje) VALUES (?, ?, ?, ?, ?, ?);', [...values]
          )
          filasafectadas = filasafectadas + result.affectedRows
          return result
        })
      )
      console.log(`Mensajes creados con éxito. ${filasafectadas} fila(s) afectadas.`)
      return db
    } catch (error) {
      console.error('Error al crear los mensajes:', error)
    } finally { // Con esto nos aseguramos de que siempre se cierre la conexión
      await connection.end()
    }
  }
}
