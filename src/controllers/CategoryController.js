import { validateCategory } from '../schemas/CategorySchema.js'

/**
 * It allows to use a model for this controller
 * @property {string} categoryModel
 */

export class CategoryController {
  constructor ({ CategoryModel }) {
    this.categoryModel = CategoryModel
  }

  getAll = async (req, res) => {
    const categories = await this.categoryModel.getAll()
    if (categories.length > 0) {
      res.json({ message: 'Categorías encontradas.', data: categories })
    } else {
      res.status(404).json({ error: 'Categorías no encontradas.' })
    }
  }

  getById = async (req, res) => {
    const { id } = req.params
    const category = await this.categoryModel.getById({ id })

    if (category) {
      return res.json({ message: 'Categoría encontrada.', data: category })
    } else {
      return res.status(404).json({ error: 'Categoría no encontrada.' })
    }
  }

  create = async (req, res) => {
    const input = validateCategory(req.body)
    if (!input.success) {
      return res.status(422).json({ error: JSON.parse(input.error.message) })
    }

    const category = await this.categoryModel.create({ input: input.data })

    if (category) {
      res.status(201).json({ message: 'Categoría creada.' })
    } else {
      return res.status(500).json({ error: 'Categoría no creada.' })
    }
  }

  patch = async (req, res) => {
    const input = validateCategory(req.body)
    const { id } = req.params

    if (!input.success) {
      return res.status(422).json({ error: JSON.parse(input.error.message) })
    }

    const category = await this.categoryModel.patch({ id, input: input.data })
    if (category) {
      res.json({ message: 'Categoría actualizada.', data: category })
    } else {
      return res.status(404).json({ error: 'Categoría no encontrada.' })
    }
  }

  delete = async (req, res) => {
    const { id } = req.params
    const category = await this.categoryModel.delete({ id })

    if (category) {
      res.json({ mesage: 'Categoría eliminada.', data: category })
    } else {
      return res.status(404).json({ error: 'Categoría no encontrada.' })
    }
  }

  deleteSelection = async (req, res) => {
    const { ids } = req.body
    const categories = await this.categoryModel.deleteSelection({ ids })

    if (categories) {
      res.json({ message: 'Categorías eliminadas.' })
    } else {
      return res.status(404).json({ error: 'Categorías no encontradas.' })
    }
  }
}
