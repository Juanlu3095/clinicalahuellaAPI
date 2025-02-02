import { Router } from 'express'
import { AppointmentController } from '../controllers/AppointmentController.js'

export const createAppointmentRouter = ({ AppointmentModel }) => {
  const appointmentRouter = Router()

  const appointmentController = new AppointmentController({ AppointmentModel })

  appointmentRouter.get('/', appointmentController.getAll)

  appointmentRouter.get('/:id', appointmentController.getById)

  appointmentRouter.post('/', appointmentController.create)

  appointmentRouter.patch('/:id', appointmentController.patch)

  appointmentRouter.delete('/:id', appointmentController.delete)

  return appointmentRouter
}
