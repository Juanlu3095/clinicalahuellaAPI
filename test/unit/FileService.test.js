import { describe, expect, test, jest, beforeEach } from '@jest/globals'

// Mocks necesarios: imageModel, FileService Class, fs/promises, fs
const mockErrorlLogs = jest.fn()
const mockmkdir = jest.fn()
const mockunlink = jest.fn()
const mockwriteFile = jest.fn()
const mockexistsSync = jest.fn()
const mockImageGetById = jest.fn()
const mockImageCreate = jest.fn()
const mockImageDelete = jest.fn()
const mockImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAEklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg=='
const mockWrongImageBase64 = 'esto_no_es_base64'
const dummyImage = [
  {
    id: 131,
    nombre: 'imagen',
    driveId: '6546s4a47s8a8s'
  }
]

// Mock errorLogs
jest.unstable_mockModule('../../src/services/errorlogs.js', () => ({
  errorLogs: mockErrorlLogs
}))

// Mocks fs y fs/promises
jest.unstable_mockModule('fs/promises', () => {
  return {
    mkdir: mockmkdir,
    unlink: mockunlink,
    writeFile: mockwriteFile
  }
})

jest.unstable_mockModule('fs', () => {
  return {
    existsSync: mockexistsSync
  }
})

jest.unstable_mockModule('../models/image.js', () => { // Esta clase es estática
  return {
    imageModel: { // Al ser una clase estática, el constructor no requiere implementación
      getById: mockImageGetById,
      create: mockImageCreate,
      delete: mockImageDelete
    }
  }
})

const { FileService } = await import('../../src/services/FileService.js')
let imageModel

beforeEach(async () => {
  const imageModelModule = await import('../models/image.js')
  imageModel = imageModelModule.imageModel

  // Reset de todos los mocks, sólo cosas como el historial de llamadas, no la implementación. Importante cuando se usan matchers como toHaveBeenCalled()
  jest.clearAllMocks()
})

describe('FileService', () => {
  test('storeImage should save an image in local disk, also create folder "./storage/images".', async () => {
    mockexistsSync.mockReturnValue(false)
    mockmkdir.mockResolvedValue()
    mockImageCreate.mockResolvedValue(15)
    const fileService = new FileService({ ImageModel: imageModel })
    await fileService.storeImage({ image: mockImageBase64 })

    expect(mockexistsSync).toHaveBeenCalledWith('./storage/images')
    expect(mockmkdir).toHaveBeenCalledWith('./storage/images/')
    expect(mockwriteFile).toHaveBeenCalled()
    expect(mockImageCreate).toHaveBeenCalled()
  })

  test('storeImage should not work because image has no base64 format.', async () => {
    const fileService = new FileService({ ImageModel: imageModel })
    await fileService.storeImage({ image: mockWrongImageBase64 })

    expect(mockErrorlLogs).toHaveBeenCalledWith(new Error('El string en base64 no es correcto.'))
    expect(mockexistsSync).not.toHaveBeenCalled()
  })

  test('storeImage should not save an image in local disk because mkdir rejects it.', async () => {
    mockexistsSync.mockReturnValue(false)
    mockmkdir.mockRejectedValue(new Error('Directorio no creado.')) // Se produce el error
    const fileService = new FileService({ ImageModel: imageModel })
    await fileService.storeImage({ image: mockImageBase64 })

    expect(mockexistsSync).toHaveBeenCalledWith('./storage/images')
    expect(mockmkdir).toHaveBeenCalledWith('./storage/images/')
    expect(mockwriteFile).not.toHaveBeenCalled()
    expect(mockImageCreate).not.toHaveBeenCalled()
    expect(mockErrorlLogs).toHaveBeenCalledWith(new Error('Directorio no creado.'))
  })

  test('storeImage should not save an image in local disk because writeFile rejects it.', async () => {
    mockexistsSync.mockReturnValue(false)
    mockmkdir.mockResolvedValue()
    mockwriteFile.mockRejectedValue(new Error('No se ha creado el archivo')) // Se produce el error
    const fileService = new FileService({ ImageModel: imageModel })
    await fileService.storeImage({ image: mockImageBase64 })

    expect(mockexistsSync).toHaveBeenCalledWith('./storage/images')
    expect(mockmkdir).toHaveBeenCalledWith('./storage/images/')
    expect(mockwriteFile).toHaveBeenCalled()
    expect(mockImageCreate).not.toHaveBeenCalled() // El método create del imageModel no se llama porque se produce el error antes
    expect(mockErrorlLogs).toHaveBeenCalledWith(new Error('No se ha creado el archivo')) // Se llama a errorLogs
  })

  test('storeImage should not save an image in local disk because method create does not work.', async () => {
    mockexistsSync.mockReturnValue(false)
    mockmkdir.mockResolvedValue()
    mockwriteFile.mockResolvedValue()
    mockImageCreate.mockRejectedValue(new Error('No se ha podido guardar la imagen en base de datos.')) // El método create de imageModel produce el error
    const fileService = new FileService({ ImageModel: imageModel })
    await fileService.storeImage({ image: mockImageBase64 })

    expect(mockexistsSync).toHaveBeenCalledWith('./storage/images')
    expect(mockmkdir).toHaveBeenCalledWith('./storage/images/')
    expect(mockwriteFile).toHaveBeenCalled()
    expect(mockImageCreate).toHaveBeenCalled()
    expect(mockErrorlLogs).toHaveBeenCalledWith(new Error('No se ha podido guardar la imagen en base de datos.')) // Se llama a errorLogs
  })

  test('deleteImage should delete an image', async () => {
    mockImageGetById.mockResolvedValue(dummyImage)
    mockunlink.mockResolvedValue()
    mockImageDelete.mockResolvedValue('Imagen eliminada.')
    const fileService = new FileService({ ImageModel: imageModel })
    await fileService.deleteImage({ id: 1 })

    expect(mockImageGetById).toHaveBeenCalledWith({ id: 1 })
    expect(mockunlink).toHaveBeenCalledWith(`./storage/images/${dummyImage[0].nombre}`)
    expect(mockImageDelete).toHaveBeenCalledWith({ id: 1 })
    expect(mockErrorlLogs).not.toHaveBeenCalled()
  })

  test('deleteImage should not delete an image because image was not found in database', async () => {
    mockImageGetById.mockRejectedValue(new Error('Imagen no encontrada'))
    const fileService = new FileService({ ImageModel: imageModel })
    await fileService.deleteImage({ id: 1 })

    expect(mockImageGetById).toHaveBeenCalledWith({ id: 1 })
    expect(mockunlink).not.toHaveBeenCalled()
    expect(mockImageDelete).not.toHaveBeenCalled()
    expect(mockErrorlLogs).toHaveBeenCalledWith(new Error('Imagen no encontrada'))
  })

  test('deleteImage should not delete an image because unlink did not work.', async () => {
    mockImageGetById.mockResolvedValue(dummyImage)
    mockunlink.mockRejectedValue(new Error('No se ha podido eliminar con unlink'))
    const fileService = new FileService({ ImageModel: imageModel })
    await fileService.deleteImage({ id: 1 })

    expect(mockImageGetById).toHaveBeenCalledWith({ id: 1 })
    expect(mockunlink).toHaveBeenCalledWith(`./storage/images/${dummyImage[0].nombre}`)
    expect(mockImageDelete).not.toHaveBeenCalled() // No se le llama porque en el try/catch falla antes el unlink
    expect(mockErrorlLogs).toHaveBeenCalledWith(new Error('No se ha podido eliminar con unlink'))
  })

  test('deleteImage should not delete an image because method delete from imageModel did not work.', async () => {
    mockImageGetById.mockResolvedValue(dummyImage)
    mockunlink.mockResolvedValue()
    mockImageDelete.mockRejectedValue(new Error('Imagen no eliminada de la base de datos.'))
    const fileService = new FileService({ ImageModel: imageModel })
    await fileService.deleteImage({ id: 1 })

    expect(mockImageGetById).toHaveBeenCalledWith({ id: 1 })
    expect(mockunlink).toHaveBeenCalledWith(`./storage/images/${dummyImage[0].nombre}`)
    expect(mockImageDelete).toHaveBeenCalledWith({ id: 1 })
    expect(mockErrorlLogs).toHaveBeenCalledWith(new Error('Imagen no eliminada de la base de datos.'))
  })
})
