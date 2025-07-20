import { repeatedValues } from '../database/utilities/validations.js'
import { postsProtected } from '../resources/PostResource.js'
import { validatePartialPost } from '../schemas/PostSchema.js'
import { DriveService } from '../services/DriveService.js'
import { isValidJwt } from '../utilities/jwtValidation.js'

/**
 * It allows to use a model for this controller
 * @property {string} postModel
 * @property {string} imageModel
 */
export class PostController {
  constructor ({ PostModel, ImageModel }) {
    this.postModel = PostModel
    this.imageModel = ImageModel
    this.fileService = new DriveService({ ImageModel: this.imageModel }) // ESTO DEBERÍA INYECTARSE DESDE APP.JS PARA LOS TESTS
  }

  getAll = async (req, res) => {
    const { categoria, estado, limit } = req.query
    let posts = await this.postModel.getAll({ categoria, estado, limit })

    if (posts.length > 0) {
      if (!isValidJwt(req.cookies._lh_tk)) posts = postsProtected({ posts })
      res.json({ message: 'Posts encontrados.', data: posts })
    } else {
      res.status(404).json({ error: 'Posts no encontrados.' })
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
    let post = await this.postModel.getBySlug({ slug })

    if (post) {
      if (!isValidJwt(req.cookies._lh_tk)) post = postsProtected({ posts: post })
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

    const repeatedSlug = repeatedValues('posts', 'slug', input.data.slug)
    if (repeatedSlug > 0) return res.status(409).json({ error: 'Slug ya existente.' })

    // Gestión del archivo
    if (input.data.imagen != null) {
      // Obtenemos la id de la carpeta
      let folderId
      const folder = await this.fileService.getFoldersByName({ name: 'lahuella' })
      if (folder.length === 0) {
        folderId = await this.fileService.createFolderDrive({ folder: 'lahuella' })
      } else {
        folderId = folder[0].id
      }

      // Guardamos la imagen en Drive y obtenemos la id de la imagen en la base de datos para meterla en la id de imagen en la tabla de posts
      const fileStoreId = await this.fileService.storeImageDrive({ image: req.body.imagen, folder: folderId })
      if (fileStoreId) {
        input.data.imagenId = fileStoreId
      } else {
        input.data.imagenId = null
      }
    }
    delete input.data.imagen // Borramos la imagen del input que ya no nos hace falta

    const post = await this.postModel.create({ input: input.data })

    if (post) {
      res.status(201).json({ message: 'Post creado.', data: post.insertId }) // Devolvemos la id del post creado, insertId lo devuelve la respuesta de mysql, como affectedRows
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

    // Se comprueba que el slug no exista en los posts
    const postToEdit = await this.postModel.getById({ id }) // Se recupera el post a editar
    const repeatedSlug = await repeatedValues('posts', 'slug', input.data.slug) // Se obtiene el número de posts con el slug indicado
    if (repeatedSlug > 1) { // Si hay más de 1 post con el slug indicado se devuelve un 409
      return res.status(409).json({ error: 'Slug ya existente.' })
    } else if (repeatedSlug === 1 && postToEdit[0].slug !== input.data.slug) { // Si hay uno repetido, puede ser el que se edita (que tiene el mismo slug porque no cambia) o puede ser el de otro post distinto
      return res.status(409).json({ error: 'Slug ya existente.' })
    }

    // Gestión del archivo
    if (input.data.imagen != null) {
      const folder = await this.fileService.getFoldersByName({ name: 'lahuella' })
      const fileStoreId = await this.fileService.storeImageDrive({ image: req.body.imagen, folder: folder[0].id }) // Contiene la id de la imagen en la BD
      const postOld = await this.postModel.getById({ id }) // Obtenemos el post para luego obtener la id de la imagen

      if (postOld[0].imagenId) {
        await this.fileService.deleteImageDrive({ id: postOld[0].imagenId }) // Eliminamos la imagen del storage y de la base de datos
      }

      if (fileStoreId) {
        input.data.imagenId = fileStoreId
      }
    }
    delete input.data.imagen // Borramos la imagen del input que ya no nos hace falta

    const post = await this.postModel.patch({ id, input: input.data })
    if (post) {
      res.json({ message: 'Post actualizado.' })
    } else {
      return res.status(404).json({ error: 'Post no encontrado.' })
    }
  }

  delete = async (req, res) => {
    const { id } = req.params
    const post = await this.postModel.getById({ id })

    // Eliminar imagen (archivo + row en BD) si el post tiene asignado una imagen
    if (post[0].imagen) {
      await this.fileService.deleteImageDrive({ id: post[0].imagenId })
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
        await this.fileService.deleteImageDrive({ id: post[0].imagenId })
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
