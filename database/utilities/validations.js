import { pool } from '../../pconnection.js'

/**
 * @param {string} table Represents the table to check in database
 * @param {string} column Represents the column to check in database
 * @param {any} value Represents the value to verify in table and column specified
 * @returns {int} Number of rows with the specified value, column and table
 */
export const repeatedValues = async (table, column, value) => {
  try {
    const sql = `SELECT * FROM ${table} WHERE ${column} = ?`
    const values = [value]

    const [result] = await pool.execute(sql, values)

    return result.length
  } catch (error) {
    console.error(error)
    throw new Error('Error al comprobar el valor único.')
  }
}
