import mysql from 'mysql2'

export class BookingSeeder {
  constructor ({ config }) {
    this.configuracion = config
  }

  createBooking = () => {
    const connection = mysql.createConnection(this.configuracion)
    const sql = 'INSERT INTO bookings (nombre, apellidos, email, telefono, fecha, hora) VALUES (?, ?, ?, ?, ?, ?);'
    const values = ['Pepe', 'López', 'jdevtoday25@gmail.com', '952123654', '2025-02-25', '12:00']

    return new Promise((resolve, reject) => {
      connection.execute(sql, values, (err, result, fields) => {
        if (err) {
          console.error('Error al crear las reservas:', err)
          reject(err)
        }
        console.log(`Reservas creadas con éxito. ${result.affectedRows} fila(s) creadas.`)
        resolve(result)
      })
      connection.end()
    })
  }
}
