import { describe, expect, test, jest, beforeEach } from '@jest/globals'
import 'dotenv/config'

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN } = process.env

const mockSetCredentials = jest.fn()
const mockOAuth2 = jest.fn().mockImplementation(() => { // Propiedad dentro de la propieadad de antes
  return {
    setCredentials: mockSetCredentials // Método dentro de la propiedad de antes
  }
})

const REDIRECT_URL = 'https://developers.google.com/oauthplayground/'

let GoogleAuth

beforeEach(async () => {
  jest.mock('googleapis', () => {
    return {
      google: { // El objeto
        auth: { // Propiedad dentro del objeto
          OAuth2: mockOAuth2 // OAuth2 es un objeto
        }
      }
    }
  })

  const googleModule = await import('../../src/services/GoogleAuthService.js')
  GoogleAuth = googleModule.setOauth2client
})

describe('GoogleAuthService', () => {
  test('Set Google credentials', () => {
    GoogleAuth()
    expect(mockSetCredentials).toHaveBeenCalledWith({ refresh_token: GOOGLE_REFRESH_TOKEN })
    expect(mockOAuth2).toHaveBeenCalledWith(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, REDIRECT_URL)
  })
})
