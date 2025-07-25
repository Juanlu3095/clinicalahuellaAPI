import mysql from 'mysql2'

export class AppointmentSeeder {
  constructor ({ config }) {
    this.configuracion = config
  }

  createAppointment = () => {
    const connection = mysql.createConnection(this.configuracion)
    const sql = 'INSERT INTO appointments (nombre, apellidos, email, telefono, fecha, hora) VALUES (?,?,?,?,?,?);'
    const appointments = [
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
        fecha: '2025-02-27',
        hora: '14:00'
      }
    ]

    // Necesitamos recuperar una promesa que tiene varias promesas, una por cada consulta a base de datos por las citas a crear
    // y luego resolver todas con Promise.all y obtener resultados. Si no hacemos las promesas no se obtienen los resultados correctamente
    // por la asincronía.
    return new Promise((resolve, reject) => { // Este resolve, reject es para el Promise.all
      const promesas = appointments.map((element) => {
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
          console.log(`Citas creadas con éxito. ${filasafectadas} fila(s) creadas.`)
          resolve(filasafectadas)
        })
        .catch((error) => {
          console.error('Error al crear las citas: ', error)
          reject(error)
        })
      connection.end()
    })
  }
}
