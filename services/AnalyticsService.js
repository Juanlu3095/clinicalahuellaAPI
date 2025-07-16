import { BetaAnalyticsDataClient } from '@google-analytics/data'

const { GOOGLE_CLIENT_SERVICE_EMAIL, GOOGLE_CLIENT_SERVICE_PRIVATE_KEY, PROPERTY_ID } = process.env

const analyticsDataClient = new BetaAnalyticsDataClient({
  credentials: {
    client_email: GOOGLE_CLIENT_SERVICE_EMAIL,
    private_key: GOOGLE_CLIENT_SERVICE_PRIVATE_KEY
  }
})

/**
 * It returns web screen views by page url from Google Analytics
 * @returns Array
 */
export const getPageUrlsAnalytics = async () => {
  const [response] = await analyticsDataClient.runReport({
    property: `properties/${PROPERTY_ID}`,
    dimensions: [
      { name: 'pagePath' }
    ],
    metrics: [
      { name: 'screenPageViews' }
    ],
    dateRanges: [
      {
        startDate: '2025-04-01',
        endDate: 'today'
      }
    ],
    limit: 10
  })
  const datos = []
  response.rows.forEach(data => {
    datos.push({ dimension: data.dimensionValues[0].value, value: data.metricValues[0].value })
  })
  return datos
}

/**
 * It returns page visits by country from Google Analytics
 * @returns Array
 */
export const getCountryAnalytics = async () => {
  const [response] = await analyticsDataClient.runReport({
    property: `properties/${PROPERTY_ID}`,
    dimensions: [
      { name: 'country' }
    ],
    metrics: [
      { name: 'screenPageViews' }
    ],
    dateRanges: [
      {
        startDate: '2025-04-01',
        endDate: 'today'
      }
    ],
    limit: 10
  })
  const datos = []
  response.rows.forEach(data => {
    datos.push({ dimension: data.dimensionValues[0].value, value: data.metricValues[0].value })
  })
  return datos
}

/**
 * It returns page visits by device from Google Analytics
 * @returns Array {dimension: string, value: string}
 */
export const getDeviceAnalytics = async () => {
  const [response] = await analyticsDataClient.runReport({
    property: `properties/${PROPERTY_ID}`,
    dimensions: [
      { name: 'deviceCategory' }
    ],
    metrics: [
      { name: 'screenPageViews' }
    ],
    dateRanges: [
      {
        startDate: '2025-04-01',
        endDate: 'today'
      }
    ]
  })
  const datos = []
  response.rows.forEach(data => {
    datos.push({ dimension: data.dimensionValues[0].value, value: data.metricValues[0].value })
  })
  return datos
}
