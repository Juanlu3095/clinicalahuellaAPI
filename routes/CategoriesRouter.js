import { Router } from 'express'
import { CategoryController } from '../controllers/CategoryController.js'

export const createCategoryRouter = ({ CategoryModel }) => {
  const categoryRouter = Router()

  const categoryController = new CategoryController({ CategoryModel })

  categoryRouter.get('/', categoryController.getAll)

  categoryRouter.get('/:id', categoryController.getById)

  categoryRouter.post('/', categoryController.create)

  categoryRouter.patch('/:id', categoryController.patch)

  categoryRouter.delete('/:id', categoryController.delete)

  categoryRouter.delete('/', categoryController.deleteSelection)

  return categoryRouter
}
