import { validateAppointment, validatePartialAppointment } from '../schemas/AppointmentSchema.js'

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
    res.json(appointments)
  }

  getById = async (req, res) => {
    const { id } = req.params
    const appointment = await this.appointmentModel.getById({ id })
    if (appointment) {
      return res.json(appointment)
    } else {
      return res.status(404).json({ respuesta: 'Cita no encontrada.' })
    }
  }

  create = async (req, res) => {
    const input = validateAppointment(req.body)
    if (!input.success) {
      return res.status(400).json({ error: JSON.parse(input.error.message) })
    }

    const appointment = await this.appointmentModel.create({ input: input.data })

    if (appointment) {
      res.status(201).json({ respuesta: 'Cita creada.' })
    } else {
      return res.status(404).json({ respuesta: 'Cita no creada.' })
    }
  }

  patch = async (req, res) => {
    const input = validatePartialAppointment(req.body)
    const { id } = req.params

    if (!input.success) {
      return res.status(400).json({ error: JSON.parse(input.error.message) })
    }

    const appointment = await this.appointmentModel.patch({ id, input: input.data })
    if (appointment) {
      res.status(200).json({ respuesta: 'Cita actualizada.', appointment })
    } else {
      return res.status(404).json({ respuesta: 'Cita no encontrada.' })
    }
  }

  delete = async (req, res) => {
    const { id } = req.params
    const appointment = await this.appointmentModel.delete({ id })

    if (appointment) {
      res.status(200).json({ respuesta: 'Cita eliminada.', appointment })
    } else {
      return res.status(404).json({ respuesta: 'Cita no encontrada.' })
    }
  }
}
