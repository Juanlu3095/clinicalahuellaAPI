import { mkdir, unlink, writeFile } from 'fs/promises'
import { errorLogs } from './errorlogs.js'
import { existsSync } from 'fs'

export class FileService {
  constructor ({ ImageModel }) {
    this.imageModel = ImageModel
  }

  /**
   * It stores an image file (.png, .jpeg, .webp) in local storage and saves information in database.
   * @param {string} image The image in base64 string format
   * @returns {int | null} It contains the id of the image in database
   */
  storeImage = async ({ image }) => {
    // Comprobar la extensión
    // match() devuelve un array con 3 elementos: 1)coincidencia completa, 2)MIME que captura regex y 3)el resto de datos que captura regex
    const matches = image.match(/^data:([A-Za-z-+/]+);base64,(.+)$/) // Comprueba si es un string en base64

    // Comprobamos que se cumpla regex
    if (matches.length !== 3) {
      errorLogs(new Error('El string en base64 no es correcto.'))
    }

    // Comprobamos que el archivo sea png o jpeg
    if (matches[1] !== 'image/png' && matches[1] !== 'image/jpeg' && matches[1] !== 'image/webp') return null

    const imagesDir = 'storage/images'
    const readDir = existsSync(`./${imagesDir}`) // Se comprueba que existe el directorio

    if (!readDir) {
      try {
        await mkdir('./storage/images/') // Crea el directorio de images si no existe
      } catch (error) {
        if (error instanceof Error) {
          errorLogs(error)
        }
      }
    }

    const base64Image = image.split(';base64,').pop() // quitamos ;base64 del String y pop elimina el último elemento del array y lo devuelve
    const extension = matches[1].split('image/') // Devuelve la extensión del archivo con split, el cual corta 'image/' de matches[1] y se devuelve '' y 'png'.

    const seconds = Date.now() // Obtenemos fecha en milisegundos desde 1970

    try {
      await writeFile(`./storage/images/image_${seconds}.${extension[1]}`, base64Image, { encoding: 'base64' })

      const input = {
        nombre: `image_${seconds}.${extension[1]}`,
        url: `storage/images/image_${seconds}.${extension[1]}`
      }
      const imageId = await this.imageModel.create({ input }) // Se guarda la imagen y se devuelve la id guardada en base de datos

      if (imageId) return imageId
      return null
    } catch (error) {
      if (error instanceof Error) {
        errorLogs(error)
      }
    }
  }

  /**
  * Deletes an image from database and storage.
  * @param {number} id Image's id in database
  */
  deleteImage = async ({ id }) => {
    const image = await this.imageModel.getById({ id }) // Obtenemos los datos de la imagen
    const nombreArchivo = image[0].nombre // Obtenemos el nombre de la imagen

    try {
      await unlink(`./storage/images/${nombreArchivo}`) // Elimina el archivo en storage
      await this.imageModel.delete({ id }) // Elimina la imagen de la base de datos
    } catch (error) {
      if (error instanceof Error) {
        errorLogs(error)
      }
    }
  }
}
