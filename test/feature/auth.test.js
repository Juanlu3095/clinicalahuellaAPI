import { app } from '../config/apptest.js'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, test } from '@jest/globals'
import { DatabaseMigration } from '../../src/database/migrations/database.js'
import { UserMigration } from '../../src/database/migrations/create_user_table.js'
import { UserSeeder } from '../../src/database/seeders/userseeder.js'

let xsrfToken = ''
let xsrfTokenAdmin = ''
let jwt = ''
let jwtCookie = ''
let databasemigration = {}

const login = {
  email: 'jcooldevelopment@gmail.com',
  password: 'jacintoPerez50@2025.'
}

const wrongLogin = {
  email: 'jcooldevelopment@gmail.com',
  password: 'j'
}

const wrongSchemaLogin = {
  email: 'pepe',
  password: 'pepe'
}

// CREACIÓN DE LA BASE DE DATOS y MIGRACIÓN DE LA TABLA USERS, ADEMÁS DE CREAR UN USUARIO VÁLIDO CON EL SEED
beforeAll(async () => {
  const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_DATABASE_TEST } = process.env
  const config = {
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_DATABASE_TEST
  }
  databasemigration = new DatabaseMigration({ config })
  await databasemigration.createDB()
  const usermigration = new UserMigration({ config })
  await usermigration.createUsers()

  const userSeeder = new UserSeeder({ config })
  await userSeeder.createuser()

  // Obtener CSRF token sin usuario logueado
  const xsrfTokenGet = await request(app).get('/csrf')
  xsrfToken = xsrfTokenGet.header['set-cookie'][0].split(';', 1)[0].split('=', 2)[1].trim()
})

afterAll(async () => {
  await databasemigration.deleteDB()
})

describe('API /auth', () => {
  test('get login should response "Usuario no autenticado."', async () => {
    const response = await request(app)
      .get('/auth/login')
    expect(response.status).toBe(401)
    expect(response.header['set-cookie']).not.toBeDefined()
  })

  test('should not log in because it has no xsrf token', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send(login)
    expect(response.status).toBe(403)
    expect(response.header['set-cookie']).not.toBeDefined()
  })

  test('should not log in because schema is incorrect', async () => {
    const response = await request(app)
      .post('/auth/login')
      .set('_xsrf_token', xsrfToken)
      .set('Cookie', `_xsrf_token=${xsrfToken}`)
      .send(wrongSchemaLogin) // El email no tiene el formato correcto
    expect(response.status).toBe(422)
    expect(response.header['set-cookie']).not.toBeDefined()
  })

  test('should not log in because user or password are incorrect', async () => {
    const response = await request(app)
      .post('/auth/login')
      .set('_xsrf_token', xsrfToken)
      .set('Cookie', `_xsrf_token=${xsrfToken}`)
      .send(wrongLogin)
    expect(response.status).toBe(401)
    expect(response.header['set-cookie']).not.toBeDefined()
  })

  test('should log in', async () => {
    const response = await request(app)
      .post('/auth/login')
      .set('_xsrf_token', xsrfToken)
      .set('Cookie', `_xsrf_token=${xsrfToken}`)
      .send(login)
    expect(response.status).toBe(200)
    expect(response.header['set-cookie'][0]).toContain('_lh_tk=') // Comprobamos que se recibe el jwt

    // Obtenemos los jwt
    jwt = response.header['set-cookie'][0]
    const jwtsplit = jwt.split(';', 1)
    jwtCookie = jwtsplit[0].split('=', 2)[1].trim()
  })

  test('get login should response "El usuario está autenticado."', async () => {
    const response = await request(app)
      .get('/auth/login')
      .set('Cookie', jwt)
    expect(response.status).toBe(200)
  })

  test('should not logout because user is not logged in.', async () => {
    const response = await request(app)
      .post('/auth/logout')
      .set('_xsrf_token', xsrfToken)
      .set('Cookie', `_xsrf_token=${xsrfToken}`)
    expect(response.status).toBe(401)
    expect(JSON.parse(response.text)).toEqual({ error: 'El usuario no está autenticado.' })
  })

  test('should not logout because xsrf_token was not sent.', async () => {
    const response = await request(app)
      .post('/auth/logout')
      .set('Cookie', jwt)
    expect(response.status).toBe(403)
  })

  test('should logout.', async () => {
    // Obtener CSRF Token con usuario logueado
    const xsrfTokenAdminGet = await request(app).get('/csrf')
      .set('Cookie', `_lh_tk=${jwtCookie}`)
    xsrfTokenAdmin = xsrfTokenAdminGet.header['set-cookie'][0].split(';', 1)[0].split('=', 2)[1].trim()

    const response = await request(app)
      .post('/auth/logout')
      .set('Cookie', jwt)
      .set('_xsrf_token', xsrfTokenAdmin)
      .set('Cookie', [`_xsrf_token=${xsrfTokenAdmin};_lh_tk=${jwtCookie}`])
    expect(response.status).toBe(200)
    expect(response.header['set-cookie'][0]).toContain('_lh_tk=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT') // Comprobamos que se elimina el jwt con el header de Express
  })
})
