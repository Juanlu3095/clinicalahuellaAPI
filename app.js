import express, { json } from 'express'
import cors from 'cors'
import { createNewsletterRouter } from './routes/newsletters.js'
import { newsletterModel } from './models/newsletter.js'

const app = express()

// middleware que captura la request y detecta si debe transformarlo para poder usarlo en el req.body y tener acceso al objeto
app.use(json())

// Desactiva esto de las respuestas de la API
app.disable('x-powered-by')

// Indicamos al CORS aquellas url que tienen acceso a nuestra API
app.use(cors({
  origin: (origin, callback) => {
    const ACCEPTED_ORIGINS = [
      '*'
    ]

    if (ACCEPTED_ORIGINS.includes(origin)) {
      return callback(null, true)
    }

    if (!origin) {
      return callback(null, true)
    }

    return callback(new Error('Not allowed by CORS'))
  }
}))

app.use('/newsletters', createNewsletterRouter({ NewsletterModel: newsletterModel }))

const PORT = process.env.PORT ?? 1234

app.listen(PORT, () => {
  console.log('Escuchando en el puerto', PORT)
})
