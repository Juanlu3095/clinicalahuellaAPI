import { Router } from 'express'
import { AuthController } from '../controllers/AuthController.js'

export const AuthRouter = ({ UserModel }) => {
  const authRouter = Router()

  const authController = new AuthController({ UserModel })

  authRouter.get('/login', authController.getLogin)

  authRouter.post('/login', authController.login)

  authRouter.post('/logout', authController.logout)

  return authRouter
}
