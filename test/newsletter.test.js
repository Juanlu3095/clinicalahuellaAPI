import { app } from './config/apptest.js'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, test } from '@jest/globals'
import { DatabaseMigration } from '../src/database/migrations/database.js'
import { UserMigration } from '../src/database/migrations/create_user_table.js'
import { UserSeeder } from '../src/database/seeders/userseeder.js'
import { NewsletterMigration } from '../src/database/migrations/create_newsletters_table.js'
import { NewsletterSeeder } from '../src/database/seeders/newsletterseeder.js'

let xsrfToken = ''
let xsrfTokenAdmin = ''
let jwt = ''
let jwtCookie = ''
let newsletters = []
let databasemigration = {}

const newNewsletter = {
  email: 'pepe@gmail.com'
}

const repeatedEmail = {
  email: 'jdevtoday25@gmail.com'
}

const wrongNewsletter = {
  email: 'pepe'
}

const updatedNewsletter = {
  email: 'pepa@gmail.com'
}

// CREACIÓN DE LA BASE DE DATOS y MIGRACIÓN DE LAS TABLAS NEWSLETTERS Y USERS, ADEMÁS DE CREAR UN USUARIO VÁLIDO CON EL SEED
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
  const newsletterMigration = new NewsletterMigration({ config })
  await newsletterMigration.createNewsletters()
  const usermigration = new UserMigration({ config })
  await usermigration.createUsers()

  const userSeeder = new UserSeeder({ config })
  await userSeeder.createuser()
  const newsletterSeeder = new NewsletterSeeder({ config })
  newsletterSeeder.createnewsletter()

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

describe('API /newsletters', () => {
  test('should create a newsletter.', async () => {
    const response = await request(app)
      .post('/newsletters')
      .set('_xsrf_token', xsrfToken)
      .set('Cookie', `_xsrf_token=${xsrfToken}`)
      .send(newNewsletter)
    expect(response.statusCode).toBe(201)
  })

  test('should not create a newsletter because already exists.', async () => {
    const response = await request(app)
      .post('/newsletters')
      .set('_xsrf_token', xsrfToken)
      .set('Cookie', `_xsrf_token=${xsrfToken}`)
      .send(repeatedEmail)
    expect(response.statusCode).toBe(409)
  })

  test('should not create a newsletter because schema is not valid.', async () => {
    const response = await request(app)
      .post('/newsletters')
      .set('_xsrf_token', xsrfToken)
      .set('Cookie', `_xsrf_token=${xsrfToken}`)
      .send(wrongNewsletter)
    expect(response.statusCode).toBe(422)
  })

  test('should not create a newsletter because xsrf_token was not sent.', async () => {
    const response = await request(app)
      .post('/newsletters')
      .send(newNewsletter)
    expect(response.statusCode).toBe(403)
  })

  test('should get all newsletters.', async () => {
    const response = await request(app)
      .get('/newsletters')
      .set('Cookie', jwt)
    expect(response.statusCode).toBe(200)
    newsletters = JSON.parse(response.text).data
    console.log('Estas son las newsletters: ', newsletters)
  })

  test('should not get all newsletters because not logged in.', async () => {
    const response = await request(app)
      .get('/newsletters')
    expect(response.statusCode).toBe(401)
  })

  test('should get a newsletter by id.', async () => {
    const response = await request(app)
      .get(`/newsletters/${newsletters[0].id}`)
      .set('Cookie', jwt)
    expect(response.statusCode).toBe(200)
  })

  test('should not get a newsletter by id because not found.', async () => {
    const response = await request(app)
      .get('/newsletters/1')
      .set('Cookie', jwt)
    expect(response.statusCode).toBe(404)
  })

  test('should not get a newsletter by id because user is not logged in.', async () => {
    const response = await request(app)
      .get(`/newsletters/${newsletters[0].id}`)
    expect(response.statusCode).toBe(401)
  })

  test('should update a newsletter by id', async () => {
    const response = await request(app)
      .patch(`/newsletters/${newsletters[0].id}`)
      .set('_xsrf_token', xsrfTokenAdmin)
      .set('Cookie', [`_xsrf_token=${xsrfTokenAdmin};_lh_tk=${jwtCookie}`])
      .send(updatedNewsletter)
    expect(response.status).toBe(200)
  })

  test('should not update a newsletter by id because the email already exists.', async () => {
    const response = await request(app)
      .patch(`/newsletters/${newsletters[0].id}`)
      .set('_xsrf_token', xsrfTokenAdmin)
      .set('Cookie', [`_xsrf_token=${xsrfTokenAdmin};_lh_tk=${jwtCookie}`])
      .send(repeatedEmail)
    expect(response.status).toBe(409)
  })

  test('should not update a newsletter by id because schema is not valid', async () => {
    const response = await request(app)
      .patch(`/newsletters/${newsletters[0].id}`)
      .set('_xsrf_token', xsrfTokenAdmin)
      .set('Cookie', [`_xsrf_token=${xsrfTokenAdmin};_lh_tk=${jwtCookie}`])
      .send(wrongNewsletter)
    expect(response.status).toBe(422)
  })

  test('should not update a newsletter by id because CSRF Protection.', async () => {
    const response = await request(app)
      .patch(`/newsletters/${newsletters[0].id}`)
      .set('Cookie', jwt)
      .send(updatedNewsletter)
    expect(response.status).toBe(403)
  })

  test('should not update a newsletter by id because not logged in.', async () => {
    const response = await request(app)
      .patch(`/newsletters/${newsletters[0].id}`)
      .set('_xsrf_token', xsrfToken)
      .set('Cookie', `_xsrf_token=${xsrfToken}`) // Si no se está logueado debe ir con el csrf token sin jwt
      .send(updatedNewsletter)
    expect(response.status).toBe(401)
  })

  test('should delete a newsletter by id', async () => {
    const response = await request(app)
      .delete(`/newsletters/${newsletters[0].id}`)
      .set('_xsrf_token', xsrfTokenAdmin)
      .set('Cookie', [`_xsrf_token=${xsrfTokenAdmin};_lh_tk=${jwtCookie}`])
    expect(response.status).toBe(200)
  })

  test('should not delete a newsletter by id because not found', async () => {
    const response = await request(app)
      .delete('/newsletters/1}')
      .set('_xsrf_token', xsrfTokenAdmin)
      .set('Cookie', [`_xsrf_token=${xsrfTokenAdmin};_lh_tk=${jwtCookie}`])
    expect(response.status).toBe(404)
  })

  test('should not delete a newsletter by id because CSRF Protection.', async () => {
    const response = await request(app)
      .delete(`/newsletters/${newsletters[0].id}`)
      .set('Cookie', jwt)
    expect(response.status).toBe(403)
  })

  test('should not delete a newsletter by id because not logged in.', async () => {
    const response = await request(app)
      .delete(`/newsletters/${newsletters[0].id}`)
      .set('_xsrf_token', xsrfToken)
      .set('Cookie', `_xsrf_token=${xsrfToken}`)
    expect(response.status).toBe(401)
  })

  test('should delete a selection of newsletters.', async () => {
    const idArray = {
      ids: [newsletters[1].id, newsletters[2].id]
    }
    const response = await request(app)
      .delete('/newsletters')
      .set('_xsrf_token', xsrfTokenAdmin)
      .set('Cookie', [`_xsrf_token=${xsrfTokenAdmin};_lh_tk=${jwtCookie}`])
      .send(idArray)
    expect(response.status).toBe(200)
  })

  test('should not delete a selection of newsletters because not found.', async () => {
    const idArray = {
      ids: ['1', '2', '3']
    }
    const response = await request(app)
      .delete('/newsletters')
      .set('_xsrf_token', xsrfTokenAdmin)
      .set('Cookie', [`_xsrf_token=${xsrfTokenAdmin};_lh_tk=${jwtCookie}`])
      .send(idArray)
    expect(response.status).toBe(404)
  })

  test('should not delete a selection of newsletters because CSRF Protection.', async () => {
    const idArray = {
      ids: [newsletters[1].id, newsletters[2].id]
    }
    const response = await request(app)
      .delete('/newsletters')
      .set('Cookie', jwt)
      .send(idArray)
    expect(response.status).toBe(403)
  })

  test('should not delete a selection of newsletters because not logged in.', async () => {
    const idArray = {
      ids: [newsletters[1].id, newsletters[2].id]
    }
    const response = await request(app)
      .delete('/newsletters')
      .set('_xsrf_token', xsrfToken)
      .set('Cookie', `_xsrf_token=${xsrfToken}`)
      .send(idArray)
    expect(response.status).toBe(401)
  })
})
