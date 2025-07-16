import { google } from 'googleapis'
import { setOauth2client } from './GoogleAuthService.js'
import { Readable } from 'stream'
import { errorLogs } from './errorlogs.js'

export class DriveService {
  constructor ({ ImageModel }) {
    this.imageModel = ImageModel
  }

  /**
   * @property (private)
   * It contains the drive auth.
   */
  #drive = google.drive({
    version: 'v3',
    auth: setOauth2client()
  })

  /**
   * Get folders stored in Drive filtered by name.
   * @param { string } name The name of the folder to search
   * @returns { drive_v3.Schema$File[] | undefined }
   */
  getFoldersByName = async ({ name }) => {
    try { // HAY QUE USAR LAS ID DE LOS ARCHIVOS DE DRIVE PARA PODER OBTENERLOS EN EL FRONTEND. VER EASYSHOP PRODUCCION RAMA
      const response = await this.#drive.files.list({
        pageSize: 10,
        fields: 'files(name,id)',
        // q: '"1Vv9afYwPxUrjqadVqpDPw2qewWV6LSBI" in parents and mimeType="application/vnd.google-apps.folder"' // Busca una carpetas dentro de una carpeta con id especifico,
        q: `name= "${name}" and mimeType="application/vnd.google-apps.folder"`
      })
      const folders = response.data.files
      console.log('GET FOLDERS: ', folders)
      return folders
    } catch (error) {
      console.error(error)
    }
  }

  /**
   * Creates a folder and return its id.
   * @param { string } folder The name of the folder to create.
   * @param { string } parent The id of the parent folder to anidate new created folder.
   * @returns { string | null | undefined }
   */
  createFolderDrive = async ({ folder, parent = null }) => {
    try {
      const fileMetadata = {
        name: folder,
        parents: [parent],
        mimeType: 'application/vnd.google-apps.folder'
      }
      const file = await this.#drive.files.create({
        requestBody: fileMetadata,
        fields: 'id,name'
      })

      await this.#drive.permissions.create({ // Modificamos el permiso para la carpeta generada
        fileId: file.data.id,
        requestBody: {
          role: 'reader',
          type: 'anyone'
        }
      })

      console.log('Folder Id:', file.data)
      return file.data.id
    } catch (error) {
      console.error(error)
    }
  }

  // https://developers.google.com/workspace/drive/api/quickstart/nodejs?hl=es-419
  // https://developers.google.com/workspace/drive/api/guides/manage-uploads?hl=es-419
  // https://developers.google.com/workspace/drive/api/guides/manage-sharing?hl=es-419#capabilities permisos
  // https://dev.to/mearjuntripathi/upload-files-on-drive-with-nodejs-15j2
  /**
   * Stores an image in Drive and returns the id of this image in database.
   * @param { string } image The image's string in base64 format.
   * @param { string } folder The id of the folder in which the image will be stored.
   * @returns { number }
   */
  storeImageDrive = async ({ image, folder }) => {
    const matches = image.match(/^data:([A-Za-z-+/]+);base64,(.+)$/) // Comprueba si es un string en base64
    const extension = matches[1].split('image/') // Devuelve la extensión del archivo con split, el cual corta 'image/' de matches[1] y se devuelve '' y 'png'.

    // Comprobamos que se cumpla regex
    if (matches.length !== 3) {
      errorLogs(new Error('El string en base64 no es correcto.'))
    }

    // Comprobamos que el archivo sea png o jpeg
    if (matches[1] !== 'image/png' && matches[1] !== 'image/jpeg' && matches[1] !== 'image/webp') return null

    const base64Image = image.replace(/^data:image\/\w+;base64,/, '') // quitamos ;base64 del String y pop elimina el último elemento del array y lo devuelve
    const base64tobuffer = Buffer.from(base64Image, 'base64') // Convierte de base64 a Buffer
    const seconds = Date.now()
    const fileName = `image_${seconds}.${extension[1]}`

    try {
      const requestBody = {
        name: fileName,
        parents: [`${folder}`], // La id de la carpeta donde se va a guardar.
        fields: 'id'
      }
      const media = {
        mimeType: `image/${extension[1]}`,
        body: Readable.from(base64tobuffer) // Hace que se pueda leer el Buffer
      }
      const response = await this.#drive.files.create({
        requestBody,
        media,
        fields: 'id'
      })
      await this.#drive.permissions.create({ // Modificamos el permiso para la carpeta generada
        fileId: response.data.id,
        requestBody: {
          role: 'reader',
          type: 'anyone'
        }
      })
      console.log('Archivo: ', media.body)
      console.log('response Id:', response.data.id)
      console.log('Tipo: ', typeof (response.data.id))

      const input = {
        nombre: fileName,
        driveId: response.data.id
      }
      const imageId = await this.imageModel.create({ input }) // Se guarda la imagen y se devuelve la id guardada en base de datos

      if (imageId) return imageId
      return null
    } catch (error) {
      console.error(error)
    }
  }

  /**
   * Deletes a file in Drive.
   * @param { string } file It contains the image id in database.
   * @returns { GaxiosResponseWithHTTP2<void> }
   */
  deleteImageDrive = async ({ id }) => {
    const image = await this.imageModel.getById({ id }) // Obtenemos los datos de la imagen
    const driveId = image[0].driveId // Obtenemos el nombre de la imagen

    try {
      await this.#drive.files.delete({
        fileId: driveId
      })
      await this.imageModel.delete({ id })
    } catch (error) {
      console.error(error)
    }
  }
}
