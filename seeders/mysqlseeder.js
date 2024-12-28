import { MessageSeeder } from './messageseeder.js'
import { NewsletterSeeder } from './newsletterseeder.js'
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
const newsletterSeeder = new NewsletterSeeder({ config })
const messageSeeder = new MessageSeeder({ config })

const seeders = async () => {
  const errors = []

  const newsletters = await newsletterSeeder.createnewsletter().catch(e => errors.push(e))
  const messages = await messageSeeder.createmessage().catch(e => errors.push(e))

  if (errors.length > 0) {
    console.error('Error en la llamada de los seeders:', errors)
  }

  return [
    newsletters, messages
  ]
}

seeders()
  .then(respuesta => console.log('Ejecución de los seeders finalizada.'))
  .catch(error => { console.error('Error al ejecutar los seeders:', error) })
