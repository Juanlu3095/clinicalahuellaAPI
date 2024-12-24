import { NewsletterSeeder } from './newsletterseeder.js'

const config = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'lahuella_db'
}

// Instanciamos las clases para usarlas, inyectándoles config
const newsletterSeeder = new NewsletterSeeder({ config })

const seeders = async () => {
  const errors = []

  const newsletters = await newsletterSeeder.createnewsletter().catch(e => errors.push(e))

  if (errors.length > 0) {
    console.error('Error en la llamada de los seeders:', errors)
  }

  return [
    newsletters
  ]
}

seeders()
  .then(respuesta => console.log('Ejecución de los seeders finalizada.'))
  .catch(error => { console.error('Error al ejecutar los seeders:', error) })
