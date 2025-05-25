import { validatePartialPost } from '../schemas/PostSchema.js'
import { storeImage } from '../services/FileService.js'

/**
 * It allows to use a model for this controller
 * @property {string} postModel
 */

export class PostController {
  constructor ({ PostModel }) {
    this.postModel = PostModel
  }

  getAll = async (req, res) => {
    const { categoria, estado, limit } = req.query
    const posts = await this.postModel.getAll({ categoria, estado, limit })
    res.json({ message: 'Posts encontrados.', data: posts })
  }

  getById = async (req, res) => {
    const { id } = req.params
    const post = await this.postModel.getById({ id })
    if (post) {
      return res.json({ message: 'Post encontrado.', data: post })
    } else {
      return res.status(404).json({ error: 'Post no encontrado.' })
    }
  }

  getBySlug = async (req, res) => {
    const { slug } = req.params
    const post = await this.postModel.getBySlug({ slug })

    if (post) {
      return res.json({ message: 'Post encontrado.', data: post })
    } else {
      return res.status(404).json({ error: 'Post no encontrado.' })
    }
  }

  create = async (req, res) => {
    const input = validatePartialPost(req.body) // Valida los datos que nos llegan. Si no se llaman igual que lo que contiene el schema, no entra en el schema para validar
    if (!input.success) {
      return res.status(422).json({ error: JSON.parse(input.error.message) })
    }

    if (input.data.imagen != null) {
      const fileStoreId = await storeImage(req.body.imagen) // Contiene la id de la imagen en la BD

      if (fileStoreId) {
        input.data.imagen = fileStoreId
      }
    }

    const post = await this.postModel.create({ input: input.data })

    if (post) {
      res.status(201).json({ message: 'Post creado.' })
    } else {
      return res.status(500).json({ error: 'Post no creado.' })
    }
  }

  patch = async (req, res) => {
    const input = validatePartialPost(req.body)
    const { id } = req.params

    if (!input.success) {
      return res.status(422).json({ error: JSON.parse(input.error.message) })
    }

    const post = await this.postModel.patch({ id, input: input.data })
    if (post) {
      res.json({ message: 'Post actualizado.', data: post })
    } else {
      return res.status(404).json({ error: 'Post no encontrado.' })
    }
  }

  delete = async (req, res) => {
    const { id } = req.params
    const post = await this.postModel.delete({ id })

    if (post) {
      res.json({ mesage: 'Post eliminado.', data: post })
    } else {
      return res.status(404).json({ error: 'Post no encontrado.' })
    }
  }
}
