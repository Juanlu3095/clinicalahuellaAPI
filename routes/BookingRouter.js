import { Router } from 'express'
import { BookingController } from '../controllers/BookingController.js'

export const createBookingRouter = ({ BookingModel }) => {
  const bookingRouter = Router()

  const bookingController = new BookingController({ BookingModel })

  bookingRouter.get('/', bookingController.getAll)

  bookingRouter.get('/:id', bookingController.getById)

  bookingRouter.post('/', bookingController.create)

  bookingRouter.patch('/:id', bookingController.patch)

  bookingRouter.delete('/:id', bookingController.delete)

  bookingRouter.delete('/', bookingController.deleteSelection)

  return bookingRouter
}
