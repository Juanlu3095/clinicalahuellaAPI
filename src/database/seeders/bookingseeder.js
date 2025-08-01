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

    return new Promise((resolve, reject) => { // Este resolve, reject es para el Promise.all
      const promesas = bookings.map((element) => {
        const values = Object.values(element)
        return new Promise((resolve, reject) => {
          return connection.execute(sql, values, (error, result) => {
            if (error) {
              return reject(error)
            }
            resolve(result.affectedRows)
          })
        })
      })

      Promise.all(promesas)
        .then((result) => {
          const filasafectadas = result.reduce((promise1, promise2) => promise1 + promise2)
          console.log(`Reservas creadas con éxito. ${filasafectadas} fila(s) creadas.`)
          resolve(filasafectadas)
        })
        .catch((error) => {
          console.error('Error al crear las reservas: ', error)
          reject(error)
        })
      connection.end()
    })
  }
}
