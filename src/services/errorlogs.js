import { appendFile } from 'fs/promises'

/**
 * It edits a log file to save errors which appears in app
 * @param {Error} error
 */
export const errorLogs = async (error) => {
  try {
    const fechaActual = new Date()
    const fecha = fechaActual.toLocaleDateString()
    const hora = fechaActual.toLocaleTimeString()

    const addError = appendFile('./storage/logs/errorlogs.txt', `\n[${fecha} ${hora}] ${error}`)
    await addError
  } catch (error) {
    console.error(error)
  }
}
