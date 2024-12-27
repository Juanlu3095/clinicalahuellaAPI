import express, { json } from 'express'
import { applycors } from './middlewares/cors.js'
import { createNewsletterRouter } from './routes/newsletters.js'
import { newsletterModel } from './models/newsletter.js'

const app = express()

// middleware que captura la request y detecta si debe transformarlo para poder usarlo en el req.body y tener acceso al objeto
app.use(json())

// Desactiva esto de las respuestas de la API
app.disable('x-powered-by')

app.use(applycors())

app.use('/newsletters', createNewsletterRouter({ NewsletterModel: newsletterModel }))

const PORT = process.env.PORT ?? 1234

app.listen(PORT, () => {
  console.log('Escuchando en el puerto', PORT)
})
