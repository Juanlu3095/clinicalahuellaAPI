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
    res.json(posts)
  }

  getById = async (req, res) => {
    const { id } = req.params
    const post = await this.postModel.getById({ id })
    if (post) {
      return res.json(post)
    } else {
      return res.status(404).json({ respuesta: 'Post no encontrado.' })
    }
  }

  create = async (req, res) => {
    const input = validatePartialPost(req.body)
    if (!input.success) {
      return res.status(400).json({ error: JSON.parse(input.error.message) })
    }

    const post = await this.postModel.create({ input: input.data })

    if (post) {
      res.status(201).json({ respuesta: 'Post creado.', post })
    } else {
      return res.status(404).json({ respuesta: 'Post no creado.' })
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
      res.status(200).json({ respuesta: 'Post actualizado.', post })
    } else {
      return res.status(404).json({ respuesta: 'Post no encontrado.' })
    }
  }

  delete = async (req, res) => {
    const { id } = req.params
    const post = await this.postModel.delete({ id })

    if (post) {
      res.status(200).json({ respuesta: 'Post eliminado.', post })
    } else {
      return res.status(404).json({ respuesta: 'Post no encontrado.' })
    }
  }
}
