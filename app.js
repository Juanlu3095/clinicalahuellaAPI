import express, { json } from 'express'
import { applycors } from './middlewares/cors.js'
import { createNewsletterRouter } from './routes/NewsletterRouter.js'
import { createMessageRouter } from './routes/MessageRouter.js'
import { createBookingRouter } from './routes/BookingRouter.js'
import { createAppointmentRouter } from './routes/AppointmentRouter.js'
import { createPostRouter } from './routes/PostRouter.js'
import { newsletterModel } from './models/newsletter.js'
import { messageModel } from './models/message.js'
import { appointmentModel } from './models/appointment.js'
import { bookingModel } from './models/booking.js'
import { postModel } from './models/post.js'
import 'dotenv/config'
import { createCategoryRouter } from './routes/CategoriesRouter.js'
import { categoryModel } from './models/category.js'

import { AiRouter } from './routes/AiRouter.js'

const app = express()

// middleware que captura la request y detecta si debe transformarlo para poder usarlo en el req.body y tener acceso al objeto
app.use(json())

// Desactiva esto de las respuestas de la API
app.disable('x-powered-by')

app.use(applycors())

/* Rutas */
// Se usa app.use para que todas las peticiones a la url indicada pasen por el 'middleware' del 2º parámetro
app.use('/newsletters', createNewsletterRouter({ NewsletterModel: newsletterModel }))
app.use('/messages', createMessageRouter({ MessageModel: messageModel }))
app.use('/bookings', createBookingRouter({ BookingModel: bookingModel }))
app.use('/appointments', createAppointmentRouter({ AppointmentModel: appointmentModel }))
app.use('/posts', createPostRouter({ PostModel: postModel }))
app.use('/categories', createCategoryRouter({ CategoryModel: categoryModel }))
app.use('/ai', AiRouter())

const PORT = process.env.PORT ?? 1234

app.listen(PORT, () => {
  console.log('Escuchando en el puerto', PORT)
})
