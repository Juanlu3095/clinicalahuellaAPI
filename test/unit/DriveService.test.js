import { describe, expect, test, jest, beforeEach } from '@jest/globals'

const getFoldersDriveResponse = [
  { id: '1YZ6iCUqsdL2t7LXaHYNIinUA5IFKzZPY', name: 'lahuella' }
]

const createFolderResponse = '1YZ6iCUqsdL2t7LXaHYNIinUA5IFKzZPP'

const storeImageDriveResponse = 15

const dummyError = 'Error al recibir respuesta.'

// Mockeamos las funciones en AiService y errorLogs
const mockgetFoldersByName = jest.fn()
const mockcreateFolderDrive = jest.fn()
const mockstoreImageDrive = jest.fn()
const mockdeleteImageDrive = jest.fn()
const mockErrorlLogs = jest.fn()

// Mock DriveService. ¡OJO! Usar unstable_mockModule para ESModules
jest.unstable_mockModule('../../src/services/DriveService.js', () => {
  return {
    DriveService: jest.fn().mockImplementation(({ ImageModel }) => { // El objeto instanciado con constructor
      return {
        ImageModel,
        getFoldersByName: mockgetFoldersByName,
        createFolderDrive: mockcreateFolderDrive,
        storeImageDrive: mockstoreImageDrive,
        deleteImageDrive: mockdeleteImageDrive
      }
    })
  }
})

// Mock errorLogs
jest.unstable_mockModule('../../src/services/errorlogs.js', () => ({
  errorLogs: mockErrorlLogs
}))

const mockImageModel = {} // Mock del parámetro recibido por el constructor de la clase

let DriveService

beforeEach(async () => {
  // Importamos el módulo mockeado
  const driveServiceModule = await import('../../src/services/DriveService.js')
  DriveService = driveServiceModule.DriveService

  // Reset de todos los mocks, sólo cosas como el historial de llamadas, no la implementación. Importante cuando se usan matchers como toHaveBeenCalled()
  jest.clearAllMocks()
})

describe('DriveService', () => {
  test('should get folders by name from Drive', async () => {
    mockgetFoldersByName.mockResolvedValue(getFoldersDriveResponse) // Hacemos que el mock devuelva una promesa que se resuelva
    const driveService = new DriveService({ ImageModel: mockImageModel }) // Le pasamos un parámetro al contructor de la clase mockeada por jest.unstable_mockModule
    const response = driveService.getFoldersByName({ name: 'lahuella' }) // Le pasamos el string como parámetro del método de la clase

    expect(DriveService).toHaveBeenCalledWith({ ImageModel: mockImageModel }) // Comprobamos el parámetro que se le pasa al constructor
    expect(mockgetFoldersByName).toHaveBeenCalledWith({ name: 'lahuella' }) // Comprobamos el parámetro que le pasamos al método
    await expect(response).resolves.toEqual(getFoldersDriveResponse) // Comprobamos que la promesa que hemos mockeado se resuelva correctamente
    // Se usa este resolves del expect porque const response no tiene un await. Si lo tuviera el expect no debe tener ni await ni resolves
  })

  test('should not get folders by name from Drive', async () => {
    // Mockeamos getFoldersByName usando mockImplementation, ya que si solo hacemos mockgetFoldersByName.mockRejectedValue(dummyError), se va a sobreescribir toda la función,
    // incluyendo el catch
    mockgetFoldersByName.mockImplementation(() => {
      try {
        throw new Error(dummyError) // Provocamos el error
      } catch (error) {
        mockErrorlLogs(error) // Hacemos que llame al mock
      }
    })

    try {
      const driveService = new DriveService({ ImageModel: mockImageModel }) // Le pasamos un parámetro al contructor de la clase mockeada por jest.unstable_mockModule
      await driveService.getFoldersByName({ name: 'lahuella' }) // Le pasamos el string como parámetro del método de la clase
    } catch (error) {
      expect(DriveService).toHaveBeenCalledWith({ ImageModel: mockImageModel }) // Comprobamos el parámetro que se le pasa al constructor
      expect(mockgetFoldersByName).toHaveBeenCalledWith({ name: 'lahuella' }) // Comprobamos el parámetro que le pasamos al método
      expect(error).toEqual(new Error(dummyError)) // Comprobamos que el error del catch sea el objeto Error con el dummyError
      expect(mockErrorlLogs).toHaveBeenCalledWith(dummyError) // Comprobamos que se llame a errorLogs Service con el dummyError como parámetro del método
    }
  })

  test('should create a folder in Drive', async () => {
    mockcreateFolderDrive.mockResolvedValue(createFolderResponse)
    const driveService = new DriveService({ ImageModel: mockImageModel })
    const response = driveService.createFolderDrive({ name: 'lahuella' })

    expect(DriveService).toHaveBeenCalledWith({ ImageModel: mockImageModel })
    expect(mockcreateFolderDrive).toHaveBeenCalledWith({ name: 'lahuella' })
    await expect(response).resolves.toEqual(createFolderResponse)
  })

  test('should not create a folder in Drive', async () => {
    mockcreateFolderDrive.mockImplementation(() => {
      try {
        throw new Error(dummyError)
      } catch (error) {
        mockErrorlLogs(error)
      }
    })

    try {
      const driveService = new DriveService({ ImageModel: mockImageModel })
      await driveService.createFolderDrive({ name: 'lahuella' })
    } catch (error) {
      expect(DriveService).toHaveBeenCalledWith({ ImageModel: mockImageModel })
      expect(mockcreateFolderDrive).toHaveBeenCalledWith({ name: 'lahuella' })
      expect(error).toEqual(new Error(dummyError))
      expect(mockErrorlLogs).toHaveBeenCalledWith(dummyError)
    }
  })

  test('should store an image in Drive', async () => {
    mockstoreImageDrive.mockResolvedValue(storeImageDriveResponse)
    const driveService = new DriveService({ ImageModel: mockImageModel })
    const response = await driveService.storeImageDrive({ image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAEklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==', folder: '1YZ6iCUqsdL2t7LXaHYNIinUA5IFKzZPY' })

    expect(DriveService).toHaveBeenCalledWith({ ImageModel: mockImageModel })
    expect(mockstoreImageDrive).toHaveBeenCalledWith({ image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAEklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==', folder: '1YZ6iCUqsdL2t7LXaHYNIinUA5IFKzZPY' })
    expect(response).toEqual(storeImageDriveResponse)
  })

  test('should not store an image in Drive', async () => {
    mockstoreImageDrive.mockImplementation(() => {
      try {
        throw new Error(dummyError)
      } catch (error) {
        mockErrorlLogs(error)
      }
    })

    try {
      const driveService = new DriveService({ ImageModel: mockImageModel })
      await driveService.storeImageDrive({ image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAEklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==', folder: '1YZ6iCUqsdL2t7LXaHYNIinUA5IFKzZPY' })
    } catch (error) {
      expect(DriveService).toHaveBeenCalledWith({ ImageModel: mockImageModel })
      expect(mockstoreImageDrive).toHaveBeenCalledWith({ image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAEklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==', folder: '1YZ6iCUqsdL2t7LXaHYNIinUA5IFKzZPY' })
      expect(error).toEqual(new Error(dummyError))
      expect(mockErrorlLogs).toHaveBeenCalledWith(dummyError)
    }
  })

  test('should delete an image in Drive', async () => {
    mockdeleteImageDrive.mockResolvedValue()
    const driveService = new DriveService({ ImageModel: mockImageModel })
    await driveService.deleteImageDrive({ id: storeImageDriveResponse })

    expect(DriveService).toHaveBeenCalledWith({ ImageModel: mockImageModel })
    expect(mockdeleteImageDrive).toHaveBeenCalledWith({ id: storeImageDriveResponse })
  })

  test('should not delete an image in Drive', async () => {
    mockdeleteImageDrive.mockImplementation(() => {
      try {
        throw new Error(dummyError)
      } catch (error) {
        mockErrorlLogs(error)
      }
    })

    try {
      const driveService = new DriveService({ ImageModel: mockImageModel })
      await driveService.deleteImageDrive({ id: storeImageDriveResponse })
    } catch (error) {
      expect(DriveService).toHaveBeenCalledWith({ ImageModel: mockImageModel })
      expect(mockdeleteImageDrive).toHaveBeenCalledWith({ id: storeImageDriveResponse })
      expect(error).toEqual(new Error(dummyError))
      expect(mockErrorlLogs).toHaveBeenCalledWith(dummyError)
    }
  })
})
