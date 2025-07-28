import { fileURLToPath } from 'url'
import path, { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url) // Obtenemos el archivo desde el que se ejecuta este script
const __dirname = dirname(__filename) // Obtenemos el directorio en el que está __filename

export class ImageController {
  /**
   * It returns a file from local disk
   * @param {*} req The request parameter.
   * @param {*} res The responseparameter
   * @returns {Buffer}
   */
  getByNombre = async (req, res) => {
    const { nombre } = req.params
    return res.sendFile(path.resolve(__dirname, '../') + `/storage/images/${nombre}`) // Obtenemos la url del archivo
  }
}
