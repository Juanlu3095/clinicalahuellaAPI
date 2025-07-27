// import { app } from './config/apptest.js'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, jest, test } from '@jest/globals'
import { DatabaseMigration } from '../src/database/migrations/database.js'
import { UserMigration } from '../src/database/migrations/create_user_table.js'
import { UserSeeder } from '../src/database/seeders/userseeder.js'

let xsrfToken = ''
let xsrfTokenAdmin = ''
let jwt = ''
let jwtCookie = ''
let databasemigration = {}

const dummyChatHistory = [
  {
    actor: 'user',
    message: '¡Hola!'
  }
]

const dummyResponse = {
  candidates: [
    {
      content: {
        parts: [
          {
            text: '¡Hola! ¿En qué puedo ayudarte hoy?\n'
          }
        ],
        role: 'model'
      }
    }
  ]
}

const mockAiChat = jest.fn().mockResolvedValue(dummyResponse)
jest.unstable_mockModule('../src/services/AiService.js', () => ({
  AiChat: mockAiChat
}))

const { app } = await import('./config/apptest.js')

// CREACIÓN DE LA BASE DE DATOS y MIGRACIÓN DE LA TABLA USERS Y CRE3ACIÓN DE UN USUARIO VÁLIDO CON EL SEED
beforeAll(async () => {
  const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_DATABASE_TEST, FIRST_USER_EMAIL, FIRST_USER_PASS } = process.env
  const config = {
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_DATABASE_TEST
  }
  databasemigration = new DatabaseMigration({ config })
  await databasemigration.createDB()
  const userMigration = new UserMigration({ config })
  await userMigration.createUsers()

  const userSeeder = new UserSeeder({ config })
  await userSeeder.createuser()

  // Obtener CSRF token
  const xsrfTokenGet = await request(app).get('/csrf')
  xsrfToken = xsrfTokenGet.header['set-cookie'][0].split(';', 1)[0].split('=', 2)[1].trim()

  // Obtener JWT
  const getJWT = await request(app).post('/auth/login')
    .set('_xsrf_token', xsrfToken)
    .set('Cookie', `_xsrf_token=${xsrfToken}`)
    .send({
      email: FIRST_USER_EMAIL,
      password: FIRST_USER_PASS
    })
  jwt = getJWT.header['set-cookie'][0]
  const jwtsplit = jwt.split(';', 1)
  jwtCookie = jwtsplit[0].split('=', 2)[1].trim()

  // Obtener CSRF Token con usuario logueado
  const xsrfTokenAdminGet = await request(app).get('/csrf')
    .set('Cookie', `_lh_tk=${jwtCookie}`)
  xsrfTokenAdmin = xsrfTokenAdminGet.header['set-cookie'][0].split(';', 1)[0].split('=', 2)[1].trim()
})

afterAll(async () => {
  await databasemigration.deleteDB()
})

describe('API /ai', () => {
  test('should send a message to Gemini IA.', async () => {
    const response = await request(app)
      .post('/ai')
      .set('_xsrf_token', xsrfTokenAdmin)
      .set('Cookie', [`_xsrf_token=${xsrfTokenAdmin};_lh_tk=${jwtCookie}`])
      .send({ messages: dummyChatHistory })
    expect(response.statusCode).toBe(200)
    expect(response.text).toBe(JSON.stringify(dummyResponse))
    expect(mockAiChat).toHaveBeenCalledWith(dummyChatHistory)
  })
})
