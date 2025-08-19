import { Router } from 'express'
import { AnalyticsController } from '../controllers/AnalyticsController.js'
import { verifyJwt } from '../middlewares/jwt.js'

export const AnalyticsRouter = () => {
  const analyticsRouter = Router()

  const analyticsController = new AnalyticsController()

  analyticsRouter.get('/pageurl', verifyJwt, analyticsController.getPageurls)

  analyticsRouter.get('/country', verifyJwt, analyticsController.getCountries)

  analyticsRouter.get('/city', verifyJwt, analyticsController.getCities)

  analyticsRouter.get('/device', verifyJwt, analyticsController.getDevices)

  return analyticsRouter
}
