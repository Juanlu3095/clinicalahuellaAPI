import { validatePartialPost } from '../schemas/PostSchema.js'
import { deleteImage, storeImage } from '../services/FileService.js'

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
    if (posts.length > 0) {
      res.json({ message: 'Posts encontrados.', data: posts })
    } else {
      res.status(404).json({ error: 'Posts no encontrados encontrados.' })
    }
  }

  getById = async (req, res) => {
    const { id } = req.params
    const post = await this.postModel.getById({ id })
    if (post) {
      return res.json({ message: 'Post encontrado.', data: post }) // Usar resource para ocultar imagenId en client ?
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

    // Gestión del archivo
    if (input.data.imagen != null) {
      const fileStoreId = await storeImage(req.body.imagen) // Contiene la id de la imagen en la BD

      if (fileStoreId) {
        input.data.imagenId = fileStoreId
      }
    } else {
      input.data.imagenId = null
    }
    delete input.data.imagen // Borramos la imagen del input que ya no nos hace falta

    const post = await this.postModel.create({ input: input.data })

    if (post) {
      res.status(201).json({ message: 'Post creado.', data: post.insertId }) // Devolvemos la id del post creado
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

    // Gestión del archivo
    if (input.data.imagen != null) {
      const fileStoreId = await storeImage(req.body.imagen) // Contiene la id de la imagen en la BD
      const postOld = await this.postModel.getById({ id }) // Obtenemos el post para luego obtener la id de la imagen

      if (postOld[0].imagenId) {
        await deleteImage({ id: postOld[0].imagenId }) // Eliminamos la imagen del storage y de la base de datos
      }

      if (fileStoreId) {
        input.data.imagenId = fileStoreId
      }
    }
    delete input.data.imagen // Borramos la imagen del input que ya no nos hace falta

    const post = await this.postModel.patch({ id, input: input.data })
    if (post) {
      res.json({ message: 'Post actualizado.', data: post })
    } else {
      return res.status(404).json({ error: 'Post no encontrado.' })
    }
  }

  delete = async (req, res) => {
    const { id } = req.params
    const post = await this.postModel.getById({ id })

    // Eliminar imagen (archivo + row en BD) si el post tiene asignado una imagen
    if (post[0].imagen) {
      await deleteImage({ id: post[0].imagenId })
    }

    const query = await this.postModel.delete({ id })

    if (query) {
      res.json({ mesage: 'Post eliminado.' })
    } else {
      return res.status(404).json({ error: 'Post no encontrado.' })
    }
  }

  deleteSelection = async (req, res) => {
    const { ids } = req.body

    // Usamos await Promise.all() para que se ejecute todo esto antes de la siguiente línea
    await Promise.all(ids.map(async (id) => {
      const post = await this.postModel.getById({ id }) // Obtenemos todos los datos del post para luego usar la id de la imagen para borrarla
      if (post[0].imagenId) { // Comprobamos si el post tiene imagen, ya que la imagen puede ser null y dar un error
        await deleteImage({ id: post[0].imagenId })
      }
    }))

    const query = await this.postModel.deleteSelection({ ids })

    if (query) {
      res.json({ mesage: 'Posts eliminados.' })
    } else {
      return res.status(404).json({ error: 'Posts no encontrados.' })
    }
  }
}
