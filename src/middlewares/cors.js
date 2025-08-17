import cors from 'cors'

export const applycors = () =>
  cors({
    origin: (origin, callback) => {
      const ORIGIN_DEVELOP = [
        'http://localhost:3000',
        'http://localhost:4200'
      ]

      const ORIGIN_PROD = [
        'https://juanlu3095.github.io'
      ]

      const ACCEPTED_ORIGINS = process.env.ENVIRONMENT === 'production' ? ORIGIN_PROD : ORIGIN_DEVELOP

      if (origin && ACCEPTED_ORIGINS.includes(origin)) {
        return callback(null, true)
      }

      // Esto es sólo para desarrollo, pues REST Client no manda origin ni tampoco es necesario para los test
      // si no se tiene una configuración personalizada de CORS.
      /* if (!origin) {
        return callback(null, true)
      } */

      return callback(new Error('Solicitud no permitida por CORS.'))
    },
    credentials: true // para que el navegador acepte y guarde cookies enviadas por la api
  })
