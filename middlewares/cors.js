import cors from 'cors'

export const applycors = () =>
  cors({
    origin: (origin, callback) => {
      const ACCEPTED_ORIGINS = [
        'http://localhost:4200',
        'http://localhost:9876',
        'http://origin.es'
      ]

      if (ACCEPTED_ORIGINS.includes(origin)) {
        console.log('cors correcto')
        return callback(null, true)
      }

      // Esto es sólo para desarrollo, pues REST Client no manda origin
      if (!origin) {
        console.log('cors incorrecto')
        return callback(null, true)
      }

      return callback(new Error('Not allowed by CORS'))
    },
    credentials: true // para que el navegador acepte y guarde cookies enviadas por la api
  })
