import cors from 'cors'

export const applycors = () =>
  cors({
    origin: (origin, callback) => {
      const ACCEPTED_ORIGINS = [
        'http://localhost:3000',
        'http://localhost:4200',
        'http://localhost:9876'
      ]

      if (ACCEPTED_ORIGINS.includes(origin)) {
        console.log('cors correcto')
        return callback(null, true)
      }

      // Esto es sólo para desarrollo, pues REST Client no manda origin ni tampoco es necesario para los test
      // si no se tiene una configuración personalizada de CORS.
      if (!origin) {
        console.log('No hay origen: ', origin)
        return callback(null, true)
      }

      return callback(new Error('Solicitud no permitida por CORS.'))
    }, // VER: https://expressjs.com/en/resources/middleware/cors.html
    credentials: true // para que el navegador acepte y guarde cookies enviadas por la api
  })
