import { Router } from 'express'
import { CategoryController } from '../controllers/CategoryController.js'
import { verifyJwt } from '../middlewares/jwt.js'

export const createCategoryRouter = ({ CategoryModel }) => {
  const categoryRouter = Router()

  const categoryController = new CategoryController({ CategoryModel })

  categoryRouter.get('/', categoryController.getAll)

  categoryRouter.get('/:id', categoryController.getById)

  categoryRouter.post('/', verifyJwt, categoryController.create)

  categoryRouter.patch('/:id', verifyJwt, categoryController.patch)

  categoryRouter.delete('/:id', verifyJwt, categoryController.delete)

  categoryRouter.delete('/', verifyJwt, categoryController.deleteSelection)

  return categoryRouter
}
