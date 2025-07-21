import { Router } from 'express'
import { ImageController } from '../controllers/ImageController.js'

export const ImageRouter = () => {
  const imagerouter = Router()
  const imagecontroller = new ImageController()

  imagerouter.get('/:nombre', imagecontroller.getByNombre) // Pasamos sólo una referencia, no la función en sí

  return imagerouter
}
