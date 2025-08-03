import { describe, expect, test, jest, beforeEach } from '@jest/globals'

const mockAppendFile = jest.fn()

jest.unstable_mockModule('fs/promises', () => {
  return {
    appendFile: mockAppendFile
  }
})

const errorLogsService = await import('../../src/services/errorlogs') // Siempre se importa el módulo después del mock

beforeEach(() => {
  jest.clearAllMocks()
})

describe('errorLogs Service', () => {
  test('should call appendFile in errorLogs.', async () => {
    mockAppendFile.mockResolvedValue()
    const fecha = new Date().toLocaleDateString()
    const hora = new Date().toLocaleTimeString()
    await errorLogsService.errorLogs(new Error('Se ha producido un error'))
    expect(mockAppendFile).toHaveBeenCalled()
    expect(mockAppendFile).toHaveBeenCalledWith('./src/storage/logs/errorlogs.txt', `\n[${fecha} ${hora}] ${new Error('Se ha producido un error')}`)
  })

  test('should call console.error because an error appeared.', async () => {
    mockAppendFile.mockRejectedValue(new Error('Error en appendfile'))
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {}) // Espiamos el console.error y con mockImplementation sobreescrimos la implementación
    const fecha = new Date().toLocaleDateString()
    const hora = new Date().toLocaleTimeString()
    const mockError = new Error('Error en una función cualquiera')

    try {
      await errorLogsService.errorLogs(mockError)
    } catch (error) {
      expect(mockAppendFile).toHaveBeenCalledWith('./src/storage/logs/errorlogs.txt', `\n[${fecha} ${hora}] ${mockError}`)
      expect(consoleSpy).toHaveBeenCalledWith(new Error('Error en appendfile'))
    }
  })
})
