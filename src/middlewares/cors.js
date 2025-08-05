import cors from 'cors'

export const applycors = () =>
  cors({
    origin: (origin, callback) => {
      const ACCEPTED_ORIGINS = [
        'http://localhost:3000',
        'http://localhost:4200'
      ]

      if (origin && ACCEPTED_ORIGINS.includes(origin)) {
        return callback(null, true)
      }

      // Esto es sólo para desarrollo, pues REST Client no manda origin ni tampoco es necesario para los test
      // si no se tiene una configuración personalizada de CORS.
      /* if (!origin) {
        console.log('No hay origen: ', origin)
        return callback(null, true)
      } */

      return callback(new Error('Solicitud no permitida por CORS.'))
    },
    credentials: true // para que el navegador acepte y guarde cookies enviadas por la api
  })
