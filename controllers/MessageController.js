import { validateMessage, validatePartialMessage } from '../schemas/MessageSchema.js'

/**
 * It allows to use a model for this controller
 * @property {string} messageModel
 */

export class MessageController {
  constructor ({ MessageModel }) {
    this.messageModel = MessageModel
  }

  getAll = async (req, res) => {
    const messages = await this.messageModel.getAll()
    res.json(messages)
  }

  getById = async (req, res) => {
    const { id } = req.params
    const message = await this.messageModel.getById({ id })
    if (message) {
      return res.json(message)
    } else {
      return res.status(404).json({ respuesta: 'Mensaje no encontrado' })
    }
  }

  create = async (req, res) => {
    const input = validateMessage(req.body)
    if (!input.success) {
      return res.status(400).json({ error: JSON.parse(input.error.message) })
    }

    const message = await this.messageModel.create({ input: input.data })

    if (message) {
      res.status(201).json({ respuesta: 'Mensaje creado.' })
    } else {
      return res.status(404).json({ respuesta: 'Mensaje no creado.' })
    }
  }

  update = async (req, res) => {
    const input = validateMessage(req.body) // Todos los campos son requeridos
    const { id } = req.params

    if (!input.success) {
      return res.status(400).json({ error: JSON.parse(input.error.message) })
    }

    const message = await this.messageModel.update({ id, input: input.data })
    if (message) {
      res.status(200).json({ respuesta: 'Mensaje actualizado.', message })
    } else {
      return res.status(404).json({ respuesta: 'Mensaje no encontrado.' })
    }
  }

  patch = async (req, res) => {
    const input = validatePartialMessage(req.body)
    const { id } = req.params

    if (!input.success) {
      return res.status(400).json({ error: JSON.parse(input.error.message) })
    }

    const message = await this.messageModel.patch({ id, input: input.data })
    if (message) {
      res.status(200).json({ respuesta: 'Mensaje actualizado.', message })
    } else {
      return res.status(404).json({ respuesta: 'Mensaje no encontrado.' })
    }
  }

  delete = async (req, res) => {
    const { id } = req.params
    const message = await this.messageModel.delete({ id })

    if (message) {
      res.status(200).json({ respuesta: 'Mensaje eliminado.', message })
    } else {
      return res.status(404).json({ respuesta: 'Mensaje no encontrado.' })
    }
  }
}
