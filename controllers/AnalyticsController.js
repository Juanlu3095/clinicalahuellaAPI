import { getPageUrlsAnalytics, getCountryAnalytics, getDeviceAnalytics } from '../services/AnalyticsService.js'

export class AnalyticsController {
  getPageurls = async (req, res) => {
    const data = await getPageUrlsAnalytics()
    if (data.length > 0) {
      res.json({ message: 'Datos encontrados.', data })
    } else {
      res.status(500).json({ error: 'Datos no encontrados.' })
    }
  }

  getCountries = async (req, res) => {
    const data = await getCountryAnalytics()
    if (data.length > 0) {
      res.json({ message: 'Datos encontrados.', data })
    } else {
      res.status(500).json({ error: 'Datos no encontrados.' })
    }
  }

  getDevices = async (req, res) => {
    const data = await getDeviceAnalytics()
    if (data.length > 0) {
      res.json({ message: 'Datos encontrados.', data })
    } else {
      res.status(500).json({ error: 'Datos no encontrados.' })
    }
  }
}
