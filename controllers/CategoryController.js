import { validatePartialCategory } from '../schemas/CategorySchema.js'

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
    res.json({ message: 'Categorías encontradas.', data: categories })
  }

  getById = async (req, res) => {
    const { id } = req.params
    const category = await this.categoryModel.getById({ id })

    if (category) {
      return res.json({ message: 'Categoría encontrada.', data: category })
    } else {
      return res.status(404).json({ message: 'Categoría no encontrada.' })
    }
  }

  create = async (req, res) => {
    const input = validatePartialCategory(req.body)
    if (!input.success) {
      return res.status(400).json({ error: JSON.parse(input.error.message) })
    }

    const category = await this.categoryModel.create({ input: input.data })

    if (category) {
      res.status(201).json({ message: 'Categoría creada.' })
    } else {
      return res.status(400).json({ message: 'Categoría no creada.' })
    }
  }

  patch = async (req, res) => {
    const input = validatePartialCategory(req.body)
    const { id } = req.params

    if (!input.success) {
      return res.status(400).json({ error: JSON.parse(input.error.message) })
    }

    const category = await this.categoryModel.patch({ id, input: input.data })
    if (category) {
      res.status(200).json({ message: 'Categoría actualizada.', data: category })
    } else {
      return res.status(404).json({ message: 'Categoría no encontrada.' })
    }
  }

  delete = async (req, res) => {
    const { id } = req.params
    const category = await this.categoryModel.delete({ id })

    if (category) {
      res.status(200).json({ mesage: 'Categoría eliminada.', data: category })
    } else {
      return res.status(404).json({ mesage: 'Categoría no encontrada.' })
    }
  }

  deleteSelection = async (req, res) => {
    const { ids } = req.body
    const categories = await this.categoryModel.deleteSelection({ ids })

    if (categories) {
      res.json({ message: 'Estos son los ids: ', data: ids })
    } else {
      return res.status(404).json({ mesage: 'Categorías no encontradas.' })
    }
  }
}
