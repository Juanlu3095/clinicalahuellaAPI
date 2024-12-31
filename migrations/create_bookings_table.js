import mysql from 'mysql2'

export class BookingMigration {
  constructor ({ config }) {
    this.configuracion = config
  }

  // Método para crear la tabla bookings con callback y creación de una promesa sin mysql2/promise
  createBookings () {
    const connection = mysql.createConnection(this.configuracion)
    const structure = `id BINARY (16) PRIMARY KEY DEFAULT(UUID_TO_BIN(UUID())), nombre VARCHAR(100) NOT NULL, apellidos VARCHAR(100) NOT NULL, email VARCHAR(255) NOT NULL,
                       telefono VARCHAR(50) NOT NULL, fecha DATE NOT NULL, hora TIME NOT NULL, created_at TIMESTAMP DEFAULT(NOW()) NOT NULL,
                       updated_at TIMESTAMP DEFAULT(CURRENT_TIMESTAMP) NOT NULL`
    return new Promise((resolve, reject) => {
      connection.query(
            `CREATE TABLE IF NOT EXISTS bookings (${structure});`,
            function (err, result, fields) {
              if (err) {
                console.error('Error al crear la tabla de bookings:', err)
                reject(err)
              }
              console.log('Tabla bookings creada con éxito.')
              resolve(result)
            }
      )
      connection.end()
    })
  }
}
