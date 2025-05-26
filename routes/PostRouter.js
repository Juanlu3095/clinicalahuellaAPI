import { Router } from 'express'
import { PostController } from '../controllers/PostController.js'

export const createPostRouter = ({ PostModel }) => {
  const postRouter = Router()

  const postController = new PostController({ PostModel })

  postRouter.get('/', postController.getAll)

  postRouter.get('/:id', postController.getById)

  postRouter.get('/slug/:slug', postController.getBySlug)

  postRouter.post('/', postController.create)

  postRouter.patch('/:id', postController.patch)

  postRouter.delete('/:id', postController.delete)

  postRouter.delete('/', postController.deleteSelection)

  return postRouter
}
