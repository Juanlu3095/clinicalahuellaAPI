import { errorLogs } from '../services/errorlogs.js'
import { pool } from '../database/pconnection.js'

export class imageModel {
  /**
   * It returns a row of image table by id.
   * @param {string} id The id of the image in database
   * @returns {QueryResult}
   */
  static async getById ({ id }) {
    try {
      const [image] = await pool.execute(
        'SELECT * FROM images WHERE id = ?;', [id]
      )

      if (image.length === 0) return null

      return image
    } catch (error) {
      if (error instanceof Error) {
        errorLogs(error.stack)
      }
    }
  }

  /**
   * It saves an image row in database and returns its generated id.
   * @param {*} input It contains the name of the file and id in Drive
   * @returns {number}
   */
  static async create ({ input }) {
    const { nombre, driveId } = input
    try {
      const [image] = await pool.execute('INSERT INTO images (nombre, driveId) VALUES (?, ?);',
        [nombre, driveId]) // REVISAR QUE metadescripcion se llame asi en el form de Angular
      if (image.affectedRows > 0) {
        const [lastIdResult] = await pool.query('SELECT LAST_INSERT_ID() lastId') // Obtenemos la id creada con la consulta anterior
        const [{ lastId }] = lastIdResult
        return lastId // Devolvemos la id de la imagen creada para después usarla para guardarla en el campo imagen de post
      }
    } catch (error) {
      if (error instanceof Error) {
        errorLogs(error.stack)
      }
    }
  }

  /**
   * It deletes an image from database.
   * @param {number} id The id of the row containing the image in database
   * @returns The result of the query
   */
  static async delete ({ id }) {
    try {
      const query = 'DELETE FROM images WHERE id = ?'
      const [result] = await pool.execute(query, [id])
      if (result.affectedRows > 0) {
        return result
      }
    } catch (error) {
      if (error instanceof Error) {
        errorLogs(error.stack)
      }
    }
  }
}
