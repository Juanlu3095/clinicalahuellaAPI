import { BookingResource } from '../resources/BookingResource.js'
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
    const requestUrl = new URL(req.connection.encrypted ? 'https' : 'http' + '://' + req.headers.referrer) // Obtenemos URL completa de donde viene la soliciud
    res.json({ message: 'Reservas encontradas.', data: BookingResource.protectedArray(bookings, requestUrl) })
  }

  getById = async (req, res) => {
    const { id } = req.params
    const booking = await this.bookingModel.getById({ id })
    const requestUrl = new URL(req.connection.encrypted ? 'https' : 'http' + '://' + req.headers.referrer)
    if (booking) {
      return res.json({ message: 'Reserva encontrada', data: BookingResource.protected(booking, requestUrl) })
    } else {
      return res.status(404).json({ error: 'Reserva no encontrada.' })
    }
  }

  create = async (req, res) => {
    const input = validateBooking(req.body)
    if (!input.success) {
      return res.status(422).json({ error: JSON.parse(input.error.message) })
    }

    const booking = await this.bookingModel.create({ input: input.data })

    if (booking) {
      res.status(201).json({ message: 'Reserva creada.' })
    } else {
      return res.status(500).json({ error: 'Reserva no creada.' })
    }
  }

  patch = async (req, res) => {
    const input = validatePartialBooking(req.body)
    const { id } = req.params

    if (!input.success) {
      return res.status(422).json({ error: JSON.parse(input.error.message) })
    }

    const booking = await this.bookingModel.patch({ id, input: input.data })
    if (booking) {
      res.json({ message: 'Reserva actualizada.' })
    } else {
      return res.status(404).json({ error: 'Reserva no encontrada.' })
    }
  }

  delete = async (req, res) => {
    const { id } = req.params
    const booking = await this.bookingModel.delete({ id })

    if (booking) {
      res.json({ message: 'Reserva eliminada.' })
    } else {
      return res.status(404).json({ error: 'Reserva no encontrada.' })
    }
  }

  deleteSelection = async (req, res) => {
    const { ids } = req.body
    const query = await this.bookingModel.deleteSelection({ ids })

    if (query) {
      res.json({ message: 'Reservas eliminadas.' })
    } else {
      return res.status(404).json({ error: 'Reservas no encontradas.' })
    }
  }
}
