import { validatePartialPost } from '../schemas/PostSchema.js'

/**
 * It allows to use a model for this controller
 * @property {string} postModel
 */

export class PostController {
  constructor ({ PostModel }) {
    this.postModel = PostModel
  }

  getAll = async (req, res) => {
    const { slug, categoria } = req.query
    const posts = await this.postModel.getAll({ slug, categoria })
    res.json({ message: 'Posts encontrados.', data: posts })
  }

  getById = async (req, res) => {
    const { id } = req.params
    const post = await this.postModel.getById({ id })
    if (post) {
      return res.json({ message: 'Post encontrado.', data: post })
    } else {
      return res.status(404).json({ message: 'Post no encontrado.' })
    }
  }

  create = async (req, res) => {
    const input = validatePartialPost(req.body)
    if (!input.success) {
      return res.status(400).json({ error: JSON.parse(input.error.message) })
    }

    const post = await this.postModel.create({ input: input.data })

    if (post) {
      res.status(201).json({ message: 'Post creado.' })
    } else {
      return res.status(400).json({ message: 'Post no creado.' })
    }
  }

  patch = async (req, res) => {
    const input = validatePartialPost(req.body)
    const { id } = req.params

    if (!input.success) {
      return res.status(400).json({ error: JSON.parse(input.error.message) })
    }

    const post = await this.postModel.patch({ id, input: input.data })
    if (post) {
      res.status(200).json({ message: 'Post actualizado.', data: post })
    } else {
      return res.status(404).json({ message: 'Post no encontrado.' })
    }
  }

  delete = async (req, res) => {
    const { id } = req.params
    const post = await this.postModel.delete({ id })

    if (post) {
      res.status(200).json({ mesage: 'Post eliminado.', data: post })
    } else {
      return res.status(404).json({ mesage: 'Post no encontrado.' })
    }
  }
}
