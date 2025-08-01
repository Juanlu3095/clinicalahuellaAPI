import { DatabaseMigration } from './database.js'
import { NewsletterMigration } from './create_newsletters_table.js'
import { MessageMigration } from './create_messages_table.js'
import { BookingMigration } from './create_bookings_table.js'
import { AppointmentMigration } from './create_appointment_table.js'
import { ImageMigration } from './create_images_table.js'
import { CategoryMigration } from './create_categories_table.js'
import { PostMigration } from './create_posts_table.js'
import { UserMigration } from './create_user_table.js'
import 'dotenv/config' // Debemos declarar esto aquí porque no pasamos el objeto config desde app.js, son independientes las migraciones del resto de la aplicación

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_DATABASE } = process.env

const config = {
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_DATABASE
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
const messagemigration = new MessageMigration({ config })
const bookingmigration = new BookingMigration({ config })
const appointmentmigration = new AppointmentMigration({ config })
const imagemigration = new ImageMigration({ config })
const categorymigration = new CategoryMigration({ config })
const postmigration = new PostMigration({ config })
const usermigration = new UserMigration({ config })

const migrations = async () => {
  const errors = []

  const database = await databasemigration.createDB().catch(e => errors.push(e))
  const newsletters = await newslettermigration.createNewsletters().catch(e => errors.push(e))
  const messages = await messagemigration.createMessages().catch(e => errors.push(e))
  const bookings = await bookingmigration.createBookings().catch(e => errors.push(e))
  const appointments = await appointmentmigration.createAppointments().catch(e => errors.push(e))
  const images = await imagemigration.createImages().catch(e => errors.push(e))
  const categories = await categorymigration.createCategories().catch(e => errors.push(e))
  const posts = await postmigration.createPosts().catch(e => errors.push(e))
  const users = await usermigration.createUsers().catch(e => errors.push(e))

  if (errors.length > 0) {
    console.log('Error en la llamada de las migraciones:', errors)
  }

  return [
    database, newsletters, messages, bookings, posts, categories, images, appointments, users
  ]
}

migrations()
  .then(r => console.log('Ejecución de las migraciones finalizada.'))
  .catch(error => console.error('Error al ejecutar las migraciones:', error))
