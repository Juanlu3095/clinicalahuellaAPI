import { Router } from 'express'
import { AiController } from '../controllers/AiController.js'

export const AiRouter = () => {
  const airouter = Router()
  const aicontroller = new AiController()

  airouter.post('/', aicontroller.aiconsulta) // Pasamos sólo una referencia, no la función en sí

  return airouter
}
