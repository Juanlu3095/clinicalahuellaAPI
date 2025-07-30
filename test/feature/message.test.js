import { app } from '../config/apptest.js'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, test } from '@jest/globals'
import { DatabaseMigration } from '../../src/database/migrations/database.js'
import { MessageMigration } from '../../src/database/migrations/create_messages_table.js'
import { UserMigration } from '../../src/database/migrations/create_user_table.js'
import { UserSeeder } from '../../src/database/seeders/userseeder.js'
import { MessageSeeder } from '../../src/database/seeders/messageseeder.js'

let xsrfToken = ''
let xsrfTokenAdmin = ''
let jwt = ''
let jwtCookie = ''
let messages = [] // Los mensajes creados con el seed y el test con POST
let databasemigration = {}

const newMessage = {
  nombre: 'Pepe',
  apellidos: 'González',
  email: 'pepi@gmail.com',
  telefono: '952122331',
  asunto: 'Hola qué tal',
  mensaje: 'Este es el mensaje creado.'
}

const wrongNewMessage = {
  nombre: 'Pepe',
  apellidos: 'González',
  email: 'pepi@gmail.com',
  telefono: 952122331,
  asunto: 'Hola qué tal',
  mensaje: 'Este es el mensaje creado.'
}

// CREACIÓN DE LA BASE DE DATOS y MIGRACIÓN DE LAS TABLAS MESSAGES Y USERS, ADEMÁS DE CREAR UN USUARIO VÁLIDO CON EL SEED
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
  const messagetablemigration = new MessageMigration({ config })
  await messagetablemigration.createMessages()
  const usermigration = new UserMigration({ config })
  await usermigration.createUsers()

  const userSeeder = new UserSeeder({ config })
  await userSeeder.createuser()
  const messageSeeder = new MessageSeeder({ config })
  messageSeeder.createmessage()

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

// TESTS
describe('API /messages', () => {
  test('should create a message.', async () => {
    const response = await request(app)
      .post('/messages')
      .set('_xsrf_token', xsrfToken)
      .set('Cookie', `_xsrf_token=${xsrfToken}`)
      .send(newMessage)
    expect(response.statusCode).toBe(201)
  })

  test('should not create a message because schema is not valid.', async () => {
    const response = await request(app)
      .post('/messages')
      .set('_xsrf_token', xsrfToken)
      .set('Cookie', `_xsrf_token=${xsrfToken}`)
      .send(wrongNewMessage)
    expect(response.statusCode).toBe(422)
  })

  test('should not create a message because xsrf_token was not sent.', async () => {
    const response = await request(app)
      .post('/messages')
      .send(newMessage)
    expect(response.statusCode).toBe(403)
  })

  test('should get all messages.', async () => {
    const response = await request(app)
      .get('/messages')
      .set('Cookie', jwt)
    expect(response.statusCode).toBe(200)
    messages = JSON.parse(response.text).data
  })

  test('should not get all messages because not logged in.', async () => {
    const response = await request(app)
      .get('/messages')
    expect(response.statusCode).toBe(401)
  })

  test('should get a message by id.', async () => {
    const response = await request(app)
      .get(`/messages/${messages[0].id}`)
      .set('Cookie', jwt)
    expect(response.statusCode).toBe(200)
  })

  test('should not get a message by id because not found.', async () => {
    const response = await request(app)
      .get('/messages/1')
      .set('Cookie', jwt)
    expect(response.statusCode).toBe(404)
  })

  test('should not get a message by id because user is not logged in.', async () => {
    const response = await request(app)
      .get(`/messages/${messages[0].id}`)
    expect(response.statusCode).toBe(401)
  })

  test('should update a message by id', async () => {
    const updatedMessage = {
      nombre: 'Pepe',
      apellidos: 'Jiménez',
      email: 'pepe@gmail.com',
      telefono: '952122331',
      asunto: 'Hola qué tal',
      mensaje: 'Este es el mensaje creado.'
    }

    const response = await request(app)
      .put(`/messages/${messages[0].id}`)
      .set('_xsrf_token', xsrfTokenAdmin)
      .set('Cookie', [`_xsrf_token=${xsrfTokenAdmin};_lh_tk=${jwtCookie}`])
      .send(updatedMessage)
    expect(response.status).toBe(200)
  })

  test('should not update a message by id because schema is not valid', async () => {
    const wrongUpdatedMessage = {
      nombre: 'Pepe',
      apellidos: 'Jiménez',
      email: 'pepe@gmail.com',
      telefono: 952122331,
      asunto: 'Hola qué tal',
      mensaje: 'Este es el mensaje creado.'
    }

    const response = await request(app)
      .put(`/messages/${messages[0].id}`)
      .set('_xsrf_token', xsrfTokenAdmin)
      .set('Cookie', [`_xsrf_token=${xsrfTokenAdmin};_lh_tk=${jwtCookie}`])
      .send(wrongUpdatedMessage)
    expect(response.status).toBe(422)
  })

  test('should not update a message by id because CSRF Protection.', async () => {
    const updatedMessage = {
      nombre: 'Pepe',
      apellidos: 'Jiménez',
      email: 'pepe@gmail.com',
      telefono: '952122331',
      asunto: 'Hola qué tal',
      mensaje: 'Este es el mensaje creado.'
    }
    const response = await request(app)
      .put(`/messages/${messages[0].id}`)
      .set('Cookie', jwt)
      .send(updatedMessage)
    expect(response.status).toBe(403)
  })

  test('should not update a message by id because not logged in.', async () => {
    const updatedMessage = {
      nombre: 'Pepe',
      apellidos: 'Jiménez',
      email: 'pepe@gmail.com',
      telefono: '952122331',
      asunto: 'Hola qué tal',
      mensaje: 'Este es el mensaje creado.'
    }
    const response = await request(app)
      .put(`/messages/${messages[0].id}`)
      .set('_xsrf_token', xsrfToken)
      .set('Cookie', `_xsrf_token=${xsrfToken}`) // Si no se está logueado debe ir con el csrf token sin jwt
      .send(updatedMessage)
    expect(response.status).toBe(401)
  })

  test('should patch a message by id', async () => {
    const updatedMessage = { // debería poder pasarse sólo algunos datos y no todo el schema
      nombre: 'Pepe'
    }

    const response = await request(app)
      .patch(`/messages/${messages[0].id}`)
      .set('_xsrf_token', xsrfTokenAdmin)
      .set('Cookie', [`_xsrf_token=${xsrfTokenAdmin};_lh_tk=${jwtCookie}`])
      .send(updatedMessage)
    expect(response.status).toBe(200)
  })

  test('should not patch a message by id because schema is not valid', async () => {
    const wrongUpdatedMessage = {
      nombre: 952122331
    }

    const response = await request(app)
      .patch(`/messages/${messages[0].id}`)
      .set('_xsrf_token', xsrfTokenAdmin)
      .set('Cookie', [`_xsrf_token=${xsrfTokenAdmin};_lh_tk=${jwtCookie}`])
      .send(wrongUpdatedMessage)
    expect(response.status).toBe(422)
  })

  test('should not patch a message by id because CSRF Protection.', async () => {
    const updatedMessage = {
      nombre: 'Pepe'
    }
    const response = await request(app)
      .patch(`/messages/${messages[0].id}`)
      .set('Cookie', jwt)
      .send(updatedMessage)
    expect(response.status).toBe(403)
  })

  test('should not patch a message by id because not logged in.', async () => {
    const updatedMessage = {
      nombre: 'Pepe'
    }
    const response = await request(app)
      .patch(`/messages/${messages[0].id}`)
      .set('_xsrf_token', xsrfToken)
      .set('Cookie', `_xsrf_token=${xsrfToken}`) // Si no se está logueado debe ir con el csrf token sin jwt
      .send(updatedMessage)
    expect(response.status).toBe(401)
  })

  test('should delete a message by id', async () => {
    const response = await request(app)
      .delete(`/messages/${messages[0].id}`)
      .set('_xsrf_token', xsrfTokenAdmin)
      .set('Cookie', [`_xsrf_token=${xsrfTokenAdmin};_lh_tk=${jwtCookie}`])
    expect(response.status).toBe(200)
  })

  test('should not delete a message by id because not found', async () => {
    const response = await request(app)
      .delete('/messages/1}')
      .set('_xsrf_token', xsrfTokenAdmin)
      .set('Cookie', [`_xsrf_token=${xsrfTokenAdmin};_lh_tk=${jwtCookie}`])
    expect(response.status).toBe(404)
  })

  test('should not delete a message by id because CSRF Protection.', async () => {
    const response = await request(app)
      .delete(`/messages/${messages[0].id}`)
      .set('Cookie', jwt)
    expect(response.status).toBe(403)
  })

  test('should not delete a message by id because not logged in.', async () => {
    const response = await request(app)
      .delete(`/messages/${messages[0].id}`)
      .set('_xsrf_token', xsrfToken)
      .set('Cookie', `_xsrf_token=${xsrfToken}`)
    expect(response.status).toBe(401)
  })

  test('should delete a selection of messages.', async () => {
    const idArray = {
      ids: [messages[1].id, messages[2].id, messages[3].id]
    }
    const response = await request(app)
      .delete('/messages')
      .set('_xsrf_token', xsrfTokenAdmin)
      .set('Cookie', [`_xsrf_token=${xsrfTokenAdmin};_lh_tk=${jwtCookie}`])
      .send(idArray)
    expect(response.status).toBe(200)
  })

  test('should not delete a selection of messages because not found.', async () => {
    const idArray = {
      ids: ['1', '2', '3']
    }
    const response = await request(app)
      .delete('/messages')
      .set('_xsrf_token', xsrfTokenAdmin)
      .set('Cookie', [`_xsrf_token=${xsrfTokenAdmin};_lh_tk=${jwtCookie}`])
      .send(idArray)
    expect(response.status).toBe(404)
  })

  test('should not delete a selection of messages because CSRF Protection.', async () => {
    const idArray = {
      ids: [messages[1].id, messages[2].id, messages[3].id]
    }
    const response = await request(app)
      .delete('/messages')
      .set('Cookie', jwt)
      .send(idArray)
    expect(response.status).toBe(403)
  })

  test('should not delete a selection of messages because not logged in.', async () => {
    const idArray = {
      ids: [messages[1].id, messages[2].id, messages[3].id]
    }
    const response = await request(app)
      .delete('/messages')
      .set('_xsrf_token', xsrfToken)
      .set('Cookie', `_xsrf_token=${xsrfToken}`)
      .send(idArray)
    expect(response.status).toBe(401)
  })
})
