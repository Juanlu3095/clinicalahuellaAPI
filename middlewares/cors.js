import cors from 'cors'

export const applycors = () =>
  cors({
    origin: (origin, callback) => {
      const ACCEPTED_ORIGINS = [
        'http://localhost:4200'
      ]

      if (ACCEPTED_ORIGINS.includes(origin)) {
        console.log('ola')
        return callback(null, true)
      }

      // Esto es sólo para desarrollo, pues REST Client no manda origin
      if (!origin) {
        console.log('adios')
        return callback(null, true)
      }

      return callback(new Error('Not allowed by CORS'))
    }
  })
