import express, { json } from 'express'
import { applycors } from './middlewares/cors.js'
import { createNewsletterRouter } from './routes/NewsletterRouter.js'
import { createMessageRouter } from './routes/MessageRouter.js'
import { createBookingRouter } from './routes/BookingRouter.js'
import { newsletterModel } from './models/newsletter.js'
import { messageModel } from './models/message.js'
import { bookingModel } from './models/booking.js'
import { postModel } from './models/post.js'
import 'dotenv/config'
import { createPostRouter } from './routes/PostRouter.js'

const app = express()

// middleware que captura la request y detecta si debe transformarlo para poder usarlo en el req.body y tener acceso al objeto
app.use(json())

// Desactiva esto de las respuestas de la API
app.disable('x-powered-by')

app.use(applycors())

/* Rutas */
app.use('/newsletters', createNewsletterRouter({ NewsletterModel: newsletterModel }))
app.use('/messages', createMessageRouter({ MessageModel: messageModel }))
app.use('/bookings', createBookingRouter({ BookingModel: bookingModel }))
app.use('/posts', createPostRouter({ PostModel: postModel }))

const PORT = process.env.PORT ?? 1234

app.listen(PORT, () => {
  console.log('Escuchando en el puerto', PORT)
})
