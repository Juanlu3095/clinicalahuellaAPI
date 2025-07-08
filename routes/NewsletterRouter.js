import { Router } from 'express'
import { NewsletterController } from '../controllers/NewsletterController.js'
import { verifyJwt } from '../middlewares/jwt.js'

export const createNewsletterRouter = ({ NewsletterModel }) => {
  const newsletterRouter = Router()

  const newsletterController = new NewsletterController({ NewsletterModel })

  newsletterRouter.get('/', verifyJwt, newsletterController.getAll) // Llama al controlador

  newsletterRouter.get('/:id', verifyJwt, newsletterController.getById)

  newsletterRouter.post('/', newsletterController.create)

  newsletterRouter.patch('/:id', verifyJwt, newsletterController.update)

  newsletterRouter.delete('/:id', verifyJwt, newsletterController.delete)

  newsletterRouter.delete('/', verifyJwt, newsletterController.deleteSelection)

  return newsletterRouter
}
