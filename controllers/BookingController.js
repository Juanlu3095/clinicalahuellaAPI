import { validateBooking, validatePartialBooking } from '../schemas/BookingSchema.js'

/**
 * It allows to use a model for this controller
 * @property {string} bookingModel
 */

export class BookingController {
  constructor ({ BookingModel }) {
    this.bookingModel = BookingModel
  }

  getAll = async (req, res) => {
    const bookings = await this.bookingModel.getAll()
    res.json(bookings)
  }

  getById = async (req, res) => {
    const { id } = req.params
    const booking = await this.bookingModel.getById({ id })
    if (booking) {
      return res.json(booking)
    } else {
      return res.status(404).json({ respuesta: 'Reserva no encontrada.' })
    }
  }

  create = async (req, res) => {
    const input = validateBooking(req.body)
    if (!input.success) {
      return res.status(400).json({ error: JSON.parse(input.error.message) })
    }

    const booking = await this.bookingModel.create({ input: input.data })

    if (booking) {
      res.status(201).json({ respuesta: 'Reserva creada.' })
    } else {
      return res.status(404).json({ respuesta: 'Reserva no creada.' })
    }
  }

  patch = async (req, res) => {
    const input = validatePartialBooking(req.body)
    const { id } = req.params

    if (!input.success) {
      return res.status(400).json({ error: JSON.parse(input.error.message) })
    }

    const booking = await this.bookingModel.patch({ id, input: input.data })
    if (booking) {
      res.status(200).json({ respuesta: 'Reserva actualizada.', booking })
    } else {
      return res.status(404).json({ respuesta: 'Reserva no encontrada.' })
    }
  }

  delete = async (req, res) => {
    const { id } = req.params
    const booking = await this.bookingModel.delete({ id })

    if (booking) {
      res.status(200).json({ respuesta: 'Reserva eliminada.', booking })
    } else {
      return res.status(404).json({ respuesta: 'Rserva no encontrada.' })
    }
  }
}