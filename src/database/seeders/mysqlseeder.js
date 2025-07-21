import { UserSeeder } from './userseeder.js'
import { BookingSeeder } from './bookingseeder.js'
import { MessageSeeder } from './messageseeder.js'
import { NewsletterSeeder } from './newsletterseeder.js'
import { CategorySeeder } from './categoryseeder.js'
import { PostSeeder } from './postseeder.js'
import 'dotenv/config'

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_DATABASE } = process.env

const config = {
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_DATABASE
}

// Instanciamos las clases para usarlas, inyectándoles config
const userSeeder = new UserSeeder({ config })
const newsletterSeeder = new NewsletterSeeder({ config })
const messageSeeder = new MessageSeeder({ config })
const bookingsSeeder = new BookingSeeder({ config })
const categoriesSeeder = new CategorySeeder({ config })
const postSeeder = new PostSeeder({ config })

const seeders = async () => {
  const errors = []

  const user = await userSeeder.createuser().catch(e => errors.push(e))
  const newsletters = await newsletterSeeder.createnewsletter().catch(e => errors.push(e))
  const messages = await messageSeeder.createmessage().catch(e => errors.push(e))
  const bookings = await bookingsSeeder.createBooking().catch(e => errors.push(e))
  const categories = await categoriesSeeder.createcategory().catch(e => errors.push(e))
  const posts = await postSeeder.createPost().catch(e => errors.push(e))

  if (errors.length > 0) {
    console.error('Error en la llamada de los seeders:', errors)
  }

  return [
    user, newsletters, messages, bookings, categories, posts
  ]
}

seeders()
  .then(respuesta => console.log('Ejecución de los seeders finalizada.'))
  .catch(error => { console.error('Error al ejecutar los seeders:', error) })
