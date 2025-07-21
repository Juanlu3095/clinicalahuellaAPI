import { Router } from 'express'
import { AiController } from '../controllers/AiController.js'
import { verifyJwt } from '../middlewares/jwt.js'

export const AiRouter = () => {
  const airouter = Router()
  const aicontroller = new AiController()

  airouter.post('/', verifyJwt, aicontroller.aiconsulta) // Pasamos sólo una referencia, no la función en sí

  return airouter
}
