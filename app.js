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
import { messageModel } from './models/message.js'
import { appointmentModel } from './models/appointment.js'
import { bookingModel } from './models/booking.js'
import { categoryModel } from './models/category.js'
import { postModel } from './models/post.js'
import 'dotenv/config'
import { userModel } from './models/user.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { validateLogin } from './schemas/LoginSchema.js'
import { doubleCsrfProtection, generateCsrfToken } from './middlewares/csrf.js'

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
// app.use('/auth') // CREAR AQUÍ EL ROUTER PARA AUTHCONTROLLER

// Usar un middleware .use para el router con login sólo, pasando el 2º parámetro. FALTA FUNCIÓN PARA VERIFICAR TOKEN
// https://dev.to/adriangrahldev/implementacion-de-autenticacion-segura-en-nodejs-con-jwt-465o
app.post('/login', async (req, res) => {
  const validation = validateLogin(req.body)
  console.log('cookies: ', req.cookies)

  if (!validation.success) {
    res.status(422).json({ error: JSON.parse(validation.error.message) })
  }

  const user = await userModel.getUserByEmail({ email: validation.data.email })
  if (user.length === 0) {
    return res.status(401).json({ error: 'Usuario y/o contraseña incorrectos.' }) // El email no es correcto
  }

  const validarPass = await bcrypt.compare(validation.data.password, user.password) // COMPROBAR SI ES NECESARIO TRY/CATCH
  if (!validarPass) {
    return res.status(401).json({ error: 'Usuario y/o contraseña incorrectos.' })
  }

  const { JWT_SECRET, ENVIRONMENT } = process.env
  const token = jwt.sign({ user: `${user.nombre} ${user.apellidos}` }, JWT_SECRET, { expiresIn: '1h' })
  res.cookie('_lh_tk', token, {
    httpOnly: true, // La cookie sólo se puede acceder en el servidor
    secure: ENVIRONMENT === 'production', // La cookie sólo se puede acceder en HTTPS. Si ENVIRONMENT es 'production' sale true
    sameSite: 'none', // Sólo se puede acceder desde el mismo dominio ?
    maxAge: 1000 * 60 * 60 // Validez máxima de 1 hora de la cookie
  }).json({ message: 'Usuario y contraseña correctos.', data: `${user.nombre} ${user.apellidos}` })
})

// Permite comprobar que un usuario esté logueado o no
app.get('/login', (req, res) => {
  const jwtToken = req.cookies._lh_tk
  console.log('cookies: ', req.cookies)
  if (!jwtToken) {
    return res.status(401).json({ error: 'El usuario no está autenticado.' })
  }
  const { JWT_SECRET } = process.env

  try {
    jwt.verify(jwtToken, JWT_SECRET)
    return res.send({ message: 'El usuario está autenticado.' })
  } catch (error) {
    return res.status(401).json({ error: 'El usuario no está autenticado o la sesión expiró.' })
  }
})

app.post('/logout', (req, res) => {
  const jwtToken = req.cookies._lh_tk

  if (!jwtToken) {
    return res.status(401).json({ error: 'El usuario no está autenticado.' })
  }
  const { JWT_SECRET } = process.env

  try {
    jwt.verify(jwtToken, JWT_SECRET)
    return res.clearCookie('_lh_tk').send({ message: 'Cierre de sesión satisfactorio.' })
  } catch (error) {
    return res.status(401).json({ error: 'El usuario no está autenticado o la sesión expiró.' })
  }
})

// Genera cookie CSRF para Angular. PARECE QUE SE TRAGA EL CSRF EN EL INICIO SESION PERO NO DESPUÉS
app.get('/csrf', (req, res) => {
  generateCsrfToken(req, res) // Crea y envia la cookie con el CSRF Token
  res.json({ message: 'Enviado nuevo csrf token' })
})

const PORT = process.env.PORT ?? 1234

app.listen(PORT, () => {
  console.log('Escuchando en el puerto', PORT)
})
