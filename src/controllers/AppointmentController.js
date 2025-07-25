import { validateAppointment, validatePartialAppointment } from '../schemas/AppointmentSchema.js'
import { sendEmailAppointment } from '../services/EmailService.js'

/**
 * It allows to use a model for this controller
 * @property {string} appointmentModel
 */

export class AppointmentController {
  constructor ({ AppointmentModel }) {
    this.appointmentModel = AppointmentModel
  }

  getAll = async (req, res) => {
    const appointments = await this.appointmentModel.getAll()
    res.json({ message: 'Citas encontradas.', data: appointments })
  }

  getById = async (req, res) => {
    const { id } = req.params
    const appointment = await this.appointmentModel.getById({ id })
    if (appointment) {
      return res.json({ message: 'Cita encontrada.', data: appointment })
    } else {
      return res.status(404).json({ error: 'Cita no encontrada.' })
    }
  }

  create = async (req, res) => {
    const input = validateAppointment(req.body)
    if (!input.success) {
      return res.status(422).json({ error: JSON.parse(input.error.message) })
    }

    const appointment = await this.appointmentModel.create({ input: input.data }) // Contiene la id de la nueva cita para pasarla al calendario

    if (appointment) {
      await sendEmailAppointment(input.data) // Enviamos el email
      res.status(201).json({ message: 'Cita creada.' })
    } else {
      return res.status(500).json({ error: 'Cita no creada.' })
    }
  }

  patch = async (req, res) => {
    const input = validatePartialAppointment(req.body)
    const { id } = req.params

    if (!input.success) {
      return res.status(422).json({ error: JSON.parse(input.error.message) })
    }

    const appointment = await this.appointmentModel.patch({ id, input: input.data })
    if (appointment) {
      res.json({ message: 'Cita actualizada.' })
    } else {
      return res.status(404).json({ error: 'Cita no encontrada.' })
    }
  }

  delete = async (req, res) => {
    const { id } = req.params
    const appointment = await this.appointmentModel.delete({ id })

    if (appointment) {
      res.json({ message: 'Cita eliminada.' })
    } else {
      return res.status(404).json({ error: 'Cita no encontrada.' })
    }
  }
}
