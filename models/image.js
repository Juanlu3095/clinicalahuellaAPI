import { errorLogs } from '../services/errorlogs.js'
import { pool } from '../pconnection.js'

export class imageModel {
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

  static async create ({ input }) {
    const { nombre, url } = input
    try {
      const [image] = await pool.execute('INSERT INTO images (nombre, image_url) VALUES (?, ?);',
        [nombre, url]) // REVISAR QUE metadescripcion se llame asi en el form de Angular
      if (image.affectedRows > 0) {
        const [lastIdResult] = await pool.query('SELECT LAST_INSERT_ID() lastId')
        const [{ lastId }] = lastIdResult
        return lastId
      }
    } catch (error) {
      if (error instanceof Error) {
        errorLogs(error.stack)
      }
    }
  }

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
