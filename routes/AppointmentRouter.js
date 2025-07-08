import { Router } from 'express'
import { AppointmentController } from '../controllers/AppointmentController.js'
import { verifyJwt } from '../middlewares/jwt.js'

export const createAppointmentRouter = ({ AppointmentModel }) => {
  const appointmentRouter = Router()

  const appointmentController = new AppointmentController({ AppointmentModel })

  appointmentRouter.get('/', verifyJwt, appointmentController.getAll)

  appointmentRouter.get('/:id', verifyJwt, appointmentController.getById)

  appointmentRouter.post('/', verifyJwt, appointmentController.create)

  appointmentRouter.patch('/:id', verifyJwt, appointmentController.patch)

  appointmentRouter.delete('/:id', verifyJwt, appointmentController.delete)

  return appointmentRouter
}
