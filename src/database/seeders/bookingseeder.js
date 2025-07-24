import mysql from 'mysql2'

export class BookingSeeder {
  constructor ({ config }) {
    this.configuracion = config
  }

  createBooking = () => {
    const connection = mysql.createConnection(this.configuracion)
    const sql = 'INSERT INTO bookings (nombre, apellidos, email, telefono, fecha, hora) VALUES (?, ?, ?, ?, ?, ?);'
    const bookings = [
      {
        nombre: 'Pepe',
        apellidos: 'López',
        email: 'plopez@gmail.com',
        telefono: '655854770',
        fecha: '2025-02-25',
        hora: '13:00'
      },
      {
        nombre: 'Alberto',
        apellidos: 'Jiménez',
        email: 'ajimenez@gmail.com',
        telefono: '655854111',
        fecha: '2025-05-27',
        hora: '14:00'
      }
    ]
    let filasafectadas = 0

    return new Promise((resolve, reject) => {
      bookings.map((element) => {
        const values = Object.values(element)
        return connection.execute(sql, values, (error, result, fields) => {
          if (error) {
            console.error('Error al crear las reservas:', error)
            reject(error)
          }
          filasafectadas = filasafectadas + result.affectedRows
          resolve(result)
        })
      })
      console.log(`Reservas creadas con éxito. ${filasafectadas} fila(s) creadas.`)
      connection.end()
    })
  }
}
