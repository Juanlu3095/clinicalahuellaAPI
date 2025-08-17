import { Router } from 'express'
import { AuthController } from '../controllers/AuthController.js'
import { verifyJwt } from '../middlewares/jwt.js'

export const AuthRouter = ({ UserModel }) => {
  const authRouter = Router()

  const authController = new AuthController({ UserModel })

  authRouter.get('/login', authController.getLogin)

  authRouter.post('/login', authController.login)

  authRouter.post('/logout', verifyJwt, authController.logout)

  return authRouter
}
