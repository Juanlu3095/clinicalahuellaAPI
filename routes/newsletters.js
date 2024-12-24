import { Router } from 'express'
import { NewsletterController } from '../controllers/NewsletterController.js'
// import { newsletterModel } from '../models/newsletter.js'

export const createNewsletterRouter = ({ NewsletterModel }) => {
  const newsletterRouter = Router()

  const newsletterController = new NewsletterController({ NewsletterModel })

  newsletterRouter.get('/', newsletterController.getAll) // Llama al controlador

  newsletterRouter.get('/:id', newsletterController.getById)

  /* newsletterRouter.post('/', newsletterController.create)

  newsletterRouter.delete('/:id', newsletterController.delete)

  newsletterRouter.patch('/:id', newsletterController.update) */

  return newsletterRouter
}