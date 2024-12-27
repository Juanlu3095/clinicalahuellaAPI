// Conexión con la base de datos de mysql
// import mysql from 'mysql2/promise'
import { DatabaseMigration } from './database.js'
import { NewsletterMigration } from './create_newsletter_table.js'

const config = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'lahuella_db'
}

/*
// Función autoinvocado que se ejecutará para crear la base de datos con el comando node mysql.js
(async () => {
  try {
    mysqldatabase.createDB()
  } catch (error) {
    console.error('Error al conectar a MySQL:', error)
    throw error
  } finally {
    connection.end() // cierra la conexion a la BD y cierra el proceso de node también
  }
})() */

// Instancias de las clases para pasarles la configuración de la base de datos
const databasemigration = new DatabaseMigration({ config })
const newslettermigration = new NewsletterMigration({ config })

const migrations = async () => {
  const errors = []

  const database = await databasemigration.createDB().catch(e => errors.push(e))
  const newsletters = await newslettermigration.createNewsletters().catch(e => errors.push(e))

  if (errors.length > 0) {
    console.log('Error en la llamada de las migraciones:', errors)
  }

  return [
    database, newsletters
  ]
}

migrations()
  .then(r => console.log('Ejecución de las migraciones finalizada.'))
  .catch(error => console.error('Error al ejecutar las migraciones:', error))
