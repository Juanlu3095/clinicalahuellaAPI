import { app } from './config/apptest.js'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, test } from '@jest/globals'
import { DatabaseMigration } from '../src/database/migrations/database.js'
import { UserMigration } from '../src/database/migrations/create_user_table.js'
import { UserSeeder } from '../src/database/seeders/userseeder.js'

let xsrfToken = ''
let jwt = ''
let databasemigration = {}

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
})

afterAll(async () => {
  await databasemigration.deleteDB()
})

describe('API /analytics', () => {
  test('should get Analytics data by page url', async () => {
    const response = await request(app)
      .get('/analytics/pageurl')
      .set('Cookie', jwt)
    expect(response.status).toBe(200)
  })

  test('should get Analytics data by country', async () => {
    const response = await request(app)
      .get('/analytics/country')
      .set('Cookie', jwt)
    expect(response.status).toBe(200)
  })

  test('should get Analytics data by device', async () => {
    const response = await request(app)
      .get('/analytics/device')
      .set('Cookie', jwt)
    expect(response.status).toBe(200)
  })
})
