import { createApp } from './app.js'
import { newsletterModel } from './models/newsletter.js'
import { messageModel } from './models/message.js'
import { bookingModel } from './models/booking.js'
import { appointmentModel } from './models/appointment.js'
import { postModel } from './models/post.js'
import { imageModel } from './models/image.js'
import { categoryModel } from './models/category.js'
import { userModel } from './models/user.js'

const app = createApp({
  NewsletterModel: newsletterModel,
  MessageModel: messageModel,
  BookingModel: bookingModel,
  AppointmentModel: appointmentModel,
  PostModel: postModel,
  ImageModel: imageModel,
  CategoryModel: categoryModel,
  UserModel: userModel
})

const PORT = process.env.PORT ?? 1234

app.listen(PORT, () => {
  console.log('Escuchando en el puerto', PORT)
})
