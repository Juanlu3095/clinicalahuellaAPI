// Conexión con la base de datos de mysql por pool connection
import { pool } from '../pconnection.js'
import { errorLogs } from '../services/errorlogs.js'

export class postModel {
  static async getAll ({ categoria, estado, limit }) {
    try { // ERROR: No se muestran los posts sin categoria aunque no pidamos un estado concreto!!! => LEFT JOIN
      let query = `SELECT posts.id, slug, titulo, contenido, images.driveId as imagen, categoriaId, categories.nombre as categoria,
                   metadescription, keywords, estado, posts.created_at, posts.updated_at
                   FROM posts
                   LEFT JOIN categories
                   ON posts.categoriaId = categories.id
                   LEFT JOIN images
                   ON posts.imagenId = images.id
                   WHERE 1=1` // Esto para poder añadir los AND sin preocuparse por cuál debe poner WHERE
      const values = [] // En este array incluimos los parámetros que se van necesitando en la consulta dependiendo de si se pasan o no
      if (categoria) {
        query += ' AND categoria = ?'
        values.push(categoria)
      }

      if (estado) {
        query += ' AND estado = ?'
        values.push(estado)
      }

      query += ' ORDER BY created_at DESC'

      if (limit) {
        query += ' LIMIT ?'
        values.push(parseInt(limit)) // ¡LOS DATOS QUE VIENEN EN REQ.QUERY SON STRINGS!
      }

      const [posts] = await pool.query(query, values)

      // Si no encuentra registros en la base de datos
      if (posts.length === 0) return []

      return posts
    } catch (error) {
      if (error instanceof Error) { // Hacemos que error sea un objeto de Error para acceder a los datos del error más fácilmente
        errorLogs(error.stack) // Stack devuelve el mensaje de los errores y las localizaciones
      }
    }
  }

  static async getById ({ id }) {
    try {
      const [post] = await pool.execute(
        `SELECT posts.id, slug, titulo, contenido, imagenId, images.driveId as imagen, categoriaId, categories.nombre as categoria,
                metadescription, keywords, estado, posts.created_at, posts.updated_at
                FROM posts
                LEFT JOIN categories
                ON posts.categoriaId = categories.id
                LEFT JOIN images
                ON posts.imagenId = images.id WHERE posts.id = ?;`, [id]
      )

      if (post.length === 0) return null

      return post
    } catch (error) {
      if (error instanceof Error) {
        errorLogs(error.stack)
      }
    }
  }

  // Esta función es solo para el cliente, por eso el estado debe ser 'publicado'
  static async getBySlug ({ slug }) {
    try {
      const [post] = await pool.execute(
        `SELECT posts.id, slug, titulo, contenido, categoriaId, categories.nombre as categoria, images.driveId as imagen,
                metadescription, keywords, estado, posts.created_at, posts.updated_at
        FROM posts
        LEFT JOIN categories
        ON posts.categoriaId = categories.id
        LEFT JOIN images
        ON posts.imagenId = images.id
        WHERE slug = ? AND estado = 'publicado';`, [slug]
      )

      if (post.length === 0) return null

      return post
    } catch (error) {
      if (error instanceof Error) {
        errorLogs(error.stack)
      }
    }
  }

  static async create ({ input }) {
    const { slug, titulo, contenido, imagenId, categoriaId, metadescripcion, keywords, estado } = input
    try {
      const [post] = await pool.execute(
        'INSERT INTO posts (slug, titulo, contenido, categoriaId, imagenId, metadescription, keywords, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?);',
        [slug, titulo, contenido, categoriaId, imagenId, metadescripcion, keywords, estado])
      if (post.affectedRows > 0) {
        return post
      }
    } catch (error) {
      if (error instanceof Error) {
        errorLogs(error.stack)
      }
    }
  }

  static async update ({ id, input }) {
    const { slug, tituto, contenido, categoriaId, imagenId, metadescripcion, keywords, estado } = input
    const today = new Date() // Obtenemos la fecha de hoy
    const date = new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().slice(0, 19).replace('T', ' ') // Obtenemos la fecha en nuestra timezone en ISO

    try {
      const query = 'UPDATE posts SET slug = ?, titulo = ?, contenido = ?, categoriaId = ?, imagenId = ?, metadescription = ?, keywords = ?, estado = ?, updated_at = ? WHERE id = ?'
      const values = [slug, tituto, contenido, categoriaId, imagenId, metadescripcion, keywords, estado, date, id]

      const [result] = await pool.execute(query, values)
      if (result.affectedRows > 0) {
        return result
      }
    } catch (error) {
      if (error instanceof Error) {
        errorLogs(error.stack)
      }
    }
  }

  // HAY QUE VER COMO METER imagenId
  static async patch ({ id, input }) {
    const keys = Object.keys(input) // Obtenemos las propiedades de un objeto JS (input)
    const values = Object.values(input) // Obtenemos los valores de un objeto JS (input)
    const setKeys = keys.map(key => `${key} = ?`).join(', ') // Quedaría algo como SET nombre = ?, ... Usamos map para transformar

    const today = new Date() // Obtenemos la fecha de hoy
    const date = new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().slice(0, 19).replace('T', ' ') // Obtenemos la fecha en nuestra timezone en ISO

    // Comprobamos que haya a campos a actualizar
    if (keys.length === 0) {
      throw new Error('No hay campos a actualizar')
    }

    try {
      const query = `UPDATE posts SET ${setKeys}, updated_at = ? WHERE id = ?`
      const [result] = await pool.execute(query, [...values, date, id])
      if (result.affectedRows > 0) {
        return result
      }
    } catch (error) {
      if (error instanceof Error) {
        errorLogs(error.stack)
      }
    }
  }

  static async delete ({ id }) {
    try {
      const query = 'DELETE FROM posts WHERE id = ?'
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

  static async deleteSelection ({ ids }) {
    try {
      const query = 'DELETE FROM posts WHERE id IN (?)'
      const [result] = await pool.query(query, [ids])

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
