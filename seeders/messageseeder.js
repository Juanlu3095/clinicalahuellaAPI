import mysql from 'mysql2/promise'

export class MessageSeeder {
  constructor ({ config }) {
    this.configuracion = config
  }

  async createmessage () {
    const connection = await mysql.createConnection(this.configuracion)
    const values = ['Pepe', 'López', 'pepe@gmail.com', '951248550', 'Pregunta cita', 'Hola, éste es un mensaje']

    try {
      const [result] = await connection.query(
        'INSERT into messages (nombre, apellidos, email, telefono, asunto, mensaje) VALUES (?);',
        [values]
      )
      console.log(`Mensajes creados con éxito. ${result.affectedRows} fila(s) afectadas.`)
      return result
    } catch (error) {
      console.error('Error al crear los mensajes:', error)
    } finally { // Con esto nos aseguramos de que siempre se cierre la conexión
      await connection.end()
    }
  }
}
