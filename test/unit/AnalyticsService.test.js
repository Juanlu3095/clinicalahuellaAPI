import { describe, expect, test, jest } from '@jest/globals'

const dataByUrls = [
  {
    dimension: '/',
    value: '67'
  },
  {
    dimension: '/contacto',
    value: '56'
  }
]

const dataByCountry = [
  {
    dimension: 'Spain',
    value: '200'
  }
]

const dataByCity = [
  {
    dimension: 'Malaga',
    value: '200'
  }
]

const dataByDevice = [
  {
    dimension: 'desktop',
    value: '20'
  },
  {
    dimension: 'mobile',
    value: '150'
  }
]

const dummyError = 'Error al recibir respuesta.'

// Mockeamos las funciones en AnalyticsService y errorLogs
const mockgetPageUrlsAnalytics = jest.fn()
const mockgetCountryAnalytics = jest.fn()
const mockgetCityAnalytics = jest.fn()
const mockgetDeviceAnalytics = jest.fn()
const mockErrorlLogs = jest.fn()

// Mock AnalyticsService
jest.unstable_mockModule('../../src/services/AnalyticsService.js', () => ({
  getPageUrlsAnalytics: mockgetPageUrlsAnalytics,
  getCityAnalytics: mockgetCityAnalytics,
  getCountryAnalytics: mockgetCountryAnalytics,
  getDeviceAnalytics: mockgetDeviceAnalytics
}))

// Mock errorLogs
jest.unstable_mockModule('../../src/services/errorlogs.js', () => ({
  errorLogs: mockErrorlLogs
}))

const { getPageUrlsAnalytics, getCountryAnalytics, getCityAnalytics, getDeviceAnalytics } = await import('../../src/services/AnalyticsService.js')

describe('AnalyticsService', () => {
  test('should get data by page url', async () => {
    mockgetPageUrlsAnalytics.mockResolvedValue(dataByUrls)
    const response = await getPageUrlsAnalytics()
    expect(mockgetPageUrlsAnalytics).toHaveBeenCalled()
    expect(response).toEqual(dataByUrls)
    expect(response[0]).toEqual({ dimension: '/', value: '67' })
  })

  test('should not get data by page url', async () => {
    const mockAnalytics = jest.mock('@google-analytics/data', () => {
      return {
        BetaAnalyticsDataClient: jest.fn().mockImplementation(() => ({ // El objeto instanciado
          runReport: () => jest.fn().mockRejectedValue(new Error(dummyError)) // El método dentro del objeto de la clase
        }))
      }
    })

    try {
      await getPageUrlsAnalytics()
    } catch (error) {
      expect(error).toEqual(new Error(dummyError))
      expect(mockAnalytics).toHaveBeenCalled()
      expect(mockgetPageUrlsAnalytics).toHaveBeenCalled()
      expect(mockErrorlLogs).toHaveBeenCalledWith(dummyError)
    }
  })

  test('should get data by country', async () => {
    mockgetCountryAnalytics.mockResolvedValue(dataByCountry)
    const response = await getCountryAnalytics()
    expect(mockgetCountryAnalytics).toHaveBeenCalled()
    expect(response).toEqual(dataByCountry)
    expect(response[0]).toEqual({ dimension: 'Spain', value: '200' })
  })

  test('should not get data by country', async () => {
    const mockAnalytics = jest.mock('@google-analytics/data', () => {
      return {
        BetaAnalyticsDataClient: jest.fn().mockImplementation(() => ({ // El objeto instanciado
          runReport: () => jest.fn().mockRejectedValue(new Error(dummyError)) // El método dentro del objeto de la clase
        }))
      }
    })

    try {
      await getCountryAnalytics()
    } catch (error) {
      expect(error).toEqual(new Error(dummyError))
      expect(mockAnalytics).toHaveBeenCalled()
      expect(mockgetCountryAnalytics).toHaveBeenCalled()
      expect(mockErrorlLogs).toHaveBeenCalledWith(dummyError)
    }
  })

  test('should get data by city', async () => {
    mockgetCityAnalytics.mockResolvedValue(dataByCity)
    const response = await getCityAnalytics()
    expect(mockgetCityAnalytics).toHaveBeenCalled()
    expect(response).toEqual(dataByCity)
    expect(response[0]).toEqual({ dimension: 'Malaga', value: '200' })
  })

  test('should not get data by city', async () => {
    const mockAnalytics = jest.mock('@google-analytics/data', () => {
      return {
        BetaAnalyticsDataClient: jest.fn().mockImplementation(() => ({ // El objeto instanciado
          runReport: () => jest.fn().mockRejectedValue(new Error(dummyError)) // El método dentro del objeto de la clase
        }))
      }
    })

    try {
      await getCityAnalytics()
    } catch (error) {
      expect(error).toEqual(new Error(dummyError))
      expect(mockAnalytics).toHaveBeenCalled()
      expect(mockgetCityAnalytics).toHaveBeenCalled()
      expect(mockErrorlLogs).toHaveBeenCalledWith(dummyError)
    }
  })

  test('should get data by device', async () => {
    mockgetDeviceAnalytics.mockResolvedValue(dataByDevice)
    const response = await getDeviceAnalytics()
    expect(mockgetDeviceAnalytics).toHaveBeenCalled()
    expect(response).toEqual(dataByDevice)
    expect(response[0]).toEqual({ dimension: 'desktop', value: '20' })
  })

  test('should not get data by device', async () => {
    const mockAnalytics = jest.mock('@google-analytics/data', () => {
      return {
        BetaAnalyticsDataClient: jest.fn().mockImplementation(() => ({ // El objeto instanciado
          runReport: () => jest.fn().mockRejectedValue(new Error(dummyError)) // El método dentro del objeto de la clase
        }))
      }
    })

    try {
      await getDeviceAnalytics()
    } catch (error) {
      expect(error).toEqual(new Error(dummyError))
      expect(mockAnalytics).toHaveBeenCalled()
      expect(mockgetDeviceAnalytics).toHaveBeenCalled()
      expect(mockErrorlLogs).toHaveBeenCalledWith(dummyError)
    }
  })
})
