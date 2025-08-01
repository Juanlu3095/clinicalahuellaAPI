import 'dotenv/config'
import express, { json } from 'express'
import { applycors } from './middlewares/cors.js'
import cookieParser from 'cookie-parser'
import { createNewsletterRouter } from './routes/NewsletterRouter.js'
import { createMessageRouter } from './routes/MessageRouter.js'
import { createBookingRouter } from './routes/BookingRouter.js'
import { createAppointmentRouter } from './routes/AppointmentRouter.js'
import { createPostRouter } from './routes/PostRouter.js'
import { createCategoryRouter } from './routes/CategoriesRouter.js'
import { AiRouter } from './routes/AiRouter.js'
import { ImageRouter } from './routes/ImagesRouter.js'
import { AnalyticsRouter } from './routes/AnalyticsRouter.js'
import { AuthRouter } from './routes/AuthRouter.js'
import { CsrfRouter } from './routes/CsrfRouter.js'
import { doubleCsrfProtection } from './middlewares/csrf.js'

export const createApp = ({ NewsletterModel, MessageModel, BookingModel, AppointmentModel, PostModel, ImageModel, CategoryModel, UserModel }) => {
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
  app.use('/newsletters', createNewsletterRouter({ NewsletterModel }))
  app.use('/messages', createMessageRouter({ MessageModel }))
  app.use('/bookings', createBookingRouter({ BookingModel }))
  app.use('/appointments', createAppointmentRouter({ AppointmentModel }))
  app.use('/posts', createPostRouter({ PostModel, ImageModel }))
  app.use('/categories', createCategoryRouter({ CategoryModel }))
  app.use('/ai', AiRouter())
  app.use('/images', ImageRouter())
  app.use('/analytics', AnalyticsRouter())
  app.use('/auth', AuthRouter({ UserModel }))
  app.use('/csrf', CsrfRouter())

  return app
}
