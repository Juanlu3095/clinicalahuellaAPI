import { Router } from 'express'
import { PostController } from '../controllers/PostController.js'
import { verifyJwt } from '../middlewares/jwt.js'

export const createPostRouter = ({ PostModel }) => {
  const postRouter = Router()

  const postController = new PostController({ PostModel })

  postRouter.get('/', postController.getAll)

  postRouter.get('/:id', postController.getById)

  postRouter.get('/slug/:slug', postController.getBySlug)

  postRouter.post('/', verifyJwt, postController.create)

  postRouter.patch('/:id', verifyJwt, postController.patch)

  postRouter.delete('/:id', verifyJwt, postController.delete)

  postRouter.delete('/', verifyJwt, postController.deleteSelection)

  return postRouter
}
