// Conexión con la base de datos de mysql por pool connection
import { pool } from '../pconnection.js'
import { errorLogs } from '../services/errorlogs.js'

export class postModel {
  static async getAll ({ categoria, limit }) {
    try {
      if (categoria) {
        const [posts] = await pool.execute(
          `SELECT posts.id, slug, titulo, contenido, categoria as categoria_id, categories.nombre as categoria,
                  posts.metadescription, posts.keywords, posts.created_at, posts.updated_at
          FROM posts
          INNER JOIN categories
          ON posts.categoria = categories.id
          WHERE categoria = ?;`, [categoria]
        )

        // Si no encuentra registros en la base de datos
        if (posts.length === 0) return []

        return posts
      }

      if (limit) {
        const [posts] = await pool.execute(
          `SELECT posts.id, slug, titulo, contenido, categoria as categoria_id, categories.nombre as categoria,
                  posts.metadescription, posts.keywords, posts.created_at, posts.updated_at
          FROM posts
          INNER JOIN categories
          ON posts.categoria = categories.id
          ORDER BY created_at DESC
          LIMIT ?;`, [limit]
        )

        // Si no encuentra registros en la base de datos
        if (posts.length === 0) return []

        return posts
      }

      const [posts] = await pool.query(
        `SELECT posts.id, slug, titulo, contenido, categoria as categoria_id, categories.nombre as categoria,
                posts.metadescription, posts.keywords, posts.created_at, posts.updated_at
         FROM posts
         INNER JOIN categories
         ON posts.categoria = categories.id`
      )

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
        'SELECT * FROM posts WHERE id = ?;', [id]
      )

      if (post.length === 0) return null

      return post
    } catch (error) {
      if (error instanceof Error) {
        errorLogs(error.stack)
      }
    }
  }

  static async getBySlug ({ slug }) {
    try {
      const [post] = await pool.execute(
        `SELECT posts.id, slug, titulo, contenido, categoria as categoria_id, categories.nombre as categoria,
                posts.metadescription, posts.keywords, posts.created_at, posts.updated_at
        FROM posts
        INNER JOIN categories
        ON posts.categoria = categories.id
        WHERE slug = ?;`, [slug]
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
    const { slug, titulo, contenido, categoria, imagen } = input
    try {
      const [post] = await pool.execute(
        'INSERT INTO posts (slug, titulo, contenido, categoria, imagen) VALUES (?, ?, ?, ?, ?);',
        [slug, titulo, contenido, categoria, imagen])
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
    const { slug, tituto, contenido, categoria, imagen } = input
    const today = new Date() // Obtenemos la fecha de hoy
    const date = new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().slice(0, 19).replace('T', ' ') // Obtenemos la fecha en nuestra timezone en ISO

    try {
      const query = 'UPDATE posts SET slug = ?, titulo = ?, contenido = ?, categoria = ?, imagen = ?, updated_at = ? WHERE id = ?'
      const values = [slug, tituto, contenido, categoria, imagen, date, id]

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
}
