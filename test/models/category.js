// Conexión con la base de datos de mysql para test por pool connection
import { pool } from '../config/dbconnection.js'

export class categoryModel {
  static async getAll () {
    try {
      const [categories] = await pool.query(
        'SELECT * FROM categories;'
      )

      // Si no encuentra registros en la base de datos
      if (categories.length === 0) return []

      return categories
    } catch (error) {
      console.error('Error en la consulta: ', error)
    }
  }

  static async getById ({ id }) {
    try {
      const [category] = await pool.execute(
        'SELECT * FROM categories WHERE id = ?;', [id]
      )

      if (category.length === 0) {
        return null
      }

      return category
    } catch (error) {
      console.error('Error en la consulta: ', error)
    }
  }

  static async create ({ input }) {
    const { nombre } = input
    try {
      const [categories] = await pool.execute(
        'INSERT INTO categories (nombre) VALUES (?);',
        [nombre])
      if (categories.affectedRows > 0) {
        return categories
      }
    } catch (error) {
      console.error('Error en la consulta: ', error)
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
      const query = `UPDATE categories SET ${setKeys}, updated_at = ? WHERE id = ?`
      const [result] = await pool.execute(query, [...values, date, id])
      if (result.affectedRows > 0) {
        return result
      }
    } catch (error) {
      console.error('Error en la consulta.', error)
    }
  }

  static async delete ({ id }) {
    try {
      const query = 'DELETE FROM categories WHERE id = ?'
      const [result] = await pool.execute(query, [id])
      if (result.affectedRows > 0) {
        return result
      }
    } catch (error) {
      console.error('Error en la consulta: ', error)
    }
  }

  static async deleteSelection ({ ids }) {
    try {
      const query = 'DELETE FROM categories WHERE id IN (?)'
      const [result] = await pool.query(query, [ids])

      if (result.affectedRows > 0) {
        return result
      }
    } catch (error) {
      console.error('Error en la consulta: ', error)
    }
  }
}
