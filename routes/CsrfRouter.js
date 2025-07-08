import { Router } from 'express'
import { CsrfController } from '../controllers/CsrfController.js'

export const CsrfRouter = () => {
  const csrfRouter = Router()
  const csrfController = new CsrfController()

  csrfRouter.get('/', csrfController.getCsrf)

  return csrfRouter
}
