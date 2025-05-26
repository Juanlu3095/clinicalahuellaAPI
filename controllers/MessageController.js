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
    if (messages.length > 0) {
      res.json({ message: 'Mensajes encontrados.', data: messages })
    } else {
      res.status(404).json({ error: 'Mensajes no encontrados' })
    }
  }

  getById = async (req, res) => {
    const { id } = req.params
    const message = await this.messageModel.getById({ id })
    if (message) {
      return res.json({ message: 'Mensaje encontrado.', data: message })
    } else {
      return res.status(404).json({ error: 'Mensaje no encontrado.' })
    }
  }

  create = async (req, res) => {
    const input = validateMessage(req.body)
    if (!input.success) {
      return res.status(422).json({ error: JSON.parse(input.error.message) })
    }

    const message = await this.messageModel.create({ input: input.data })

    if (message) {
      res.status(201).json({ message: 'Mensaje enviado.' })
    } else {
      return res.status(500).json({ error: 'Mensaje no creado.' })
    }
  }

  update = async (req, res) => {
    const input = validateMessage(req.body) // Todos los campos son requeridos
    const { id } = req.params

    if (!input.success) {
      return res.status(422).json({ error: JSON.parse(input.error.message) })
    }

    const message = await this.messageModel.update({ id, input: input.data })
    if (message) {
      res.json({ message: 'Mensaje actualizado.' })
    } else {
      return res.status(404).json({ error: 'Mensaje no encontrado.' })
    }
  }

  patch = async (req, res) => {
    const input = validatePartialMessage(req.body)
    const { id } = req.params

    if (!input.success) {
      return res.status(422).json({ error: JSON.parse(input.error.message) })
    }

    const message = await this.messageModel.patch({ id, input: input.data })
    if (message) {
      res.json({ message: 'Mensaje actualizado.' })
    } else {
      return res.status(404).json({ error: 'Mensaje no encontrado.' })
    }
  }

  delete = async (req, res) => {
    const { id } = req.params
    const message = await this.messageModel.delete({ id })

    if (message) {
      res.json({ message: 'Mensaje eliminado.' })
    } else {
      return res.status(404).json({ error: 'Mensaje no encontrado.' })
    }
  }

  deleteSelection = async (req, res) => {
    const { ids } = req.body
    const messages = await this.messageModel.deleteSelection({ ids })

    if (messages) {
      res.json({ message: 'Mensajes eliminados.' })
    } else {
      return res.status(404).json({ error: 'Mensajes no encontrados.' })
    }
  }
}
