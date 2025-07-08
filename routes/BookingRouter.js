import { Router } from 'express'
import { BookingController } from '../controllers/BookingController.js'
import { verifyJwt } from '../middlewares/jwt.js'

export const createBookingRouter = ({ BookingModel }) => {
  const bookingRouter = Router()

  const bookingController = new BookingController({ BookingModel })

  bookingRouter.get('/', verifyJwt, bookingController.getAll)

  bookingRouter.get('/:id', verifyJwt, bookingController.getById)

  bookingRouter.post('/', bookingController.create)

  bookingRouter.patch('/:id', verifyJwt, bookingController.patch)

  bookingRouter.delete('/:id', verifyJwt, bookingController.delete)

  bookingRouter.delete('/', verifyJwt, bookingController.deleteSelection)

  return bookingRouter
}
