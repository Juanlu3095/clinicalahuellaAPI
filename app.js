import express, { json } from 'express'
import { applycors } from './middlewares/cors.js'
import cookieParser from 'cookie-parser'
import { createNewsletterRouter } from './routes/NewsletterRouter.js'
import { createMessageRouter } from './routes/MessageRouter.js'
import { createBookingRouter } from './routes/BookingRouter.js'
import { createAppointmentRouter } from './routes/AppointmentRouter.js'
import { createPostRouter } from './routes/PostRouter.js'
import { createCategoryRouter } from './routes/CategoriesRouter.js'
import { newsletterModel } from './models/newsletter.js'
import { AiRouter } from './routes/AiRouter.js'
import { ImageRouter } from './routes/ImagesRouter.js'
import { AnalyticsRouter } from './routes/AnalyticsRouter.js'
import { AuthRouter } from './routes/AuthRouter.js'
import { CsrfRouter } from './routes/CsrfRouter.js'
import { messageModel } from './models/message.js'
import { appointmentModel } from './models/appointment.js'
import { bookingModel } from './models/booking.js'
import { categoryModel } from './models/category.js'
import { postModel } from './models/post.js'
import { userModel } from './models/user.js'
import { doubleCsrfProtection } from './middlewares/csrf.js'

const app = express()

// middleware que captura la request y detecta si debe transformarlo para poder usarlo en el req.body y tener acceso al objeto
app.use(json({ limit: '10mb', extended: true })) // Sólo permite 10 mb de tamaño de json. Para arreglar PayloadTooLargeError: request entity too large

// Desactiva esto de las respuestas de la API
app.disable('x-powered-by')

app.use(cookieParser()) // Permite trabajar con cookies

app.use(applycors())

app.use(doubleCsrfProtection)

/* Rutas */
// Se usa app.use para que todas las peticiones a la url indicada pasen por el 'middleware' del 2º parámetro
app.use('/newsletters', createNewsletterRouter({ NewsletterModel: newsletterModel }))
app.use('/messages', createMessageRouter({ MessageModel: messageModel }))
app.use('/bookings', createBookingRouter({ BookingModel: bookingModel }))
app.use('/appointments', createAppointmentRouter({ AppointmentModel: appointmentModel }))
app.use('/posts', createPostRouter({ PostModel: postModel }))
app.use('/categories', createCategoryRouter({ CategoryModel: categoryModel }))
app.use('/ai', AiRouter())
app.use('/images', ImageRouter())
app.use('/analytics', AnalyticsRouter())
app.use('/auth', AuthRouter({ UserModel: userModel }))
app.use('/csrf', CsrfRouter())

const PORT = process.env.PORT ?? 1234

app.listen(PORT, () => {
  console.log('Escuchando en el puerto', PORT)
})
