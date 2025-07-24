import { app } from './config/apptest.js'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, test } from '@jest/globals'
import { DatabaseMigration } from '../src/database/migrations/database.js'
import { UserMigration } from '../src/database/migrations/create_user_table.js'
import { UserSeeder } from '../src/database/seeders/userseeder.js'
import { BookingMigration } from '../src/database/migrations/create_bookings_table.js'
import { BookingSeeder } from '../src/database/seeders/bookingseeder.js'

let xsrfToken = ''
let xsrfTokenAdmin = ''
let jwt = ''
let jwtCookie = ''
let bookings = []
let databasemigration = {}

const newBooking = {
  nombre: 'Alba',
  apellidos: 'Moreno',
  email: 'amoreno@gmail.com',
  telefono: '655854770',
  fecha: '2025-09-25',
  hora: '12:00'
}

const wrongBooking = {
  nombre: 'Alba',
  apellidos: 'Moreno',
  email: 'amoreno@gmail.com',
  telefono: 655854770,
  fecha: '2025-09-25',
  hora: '12:00'
}

const updateBooking = {
  nombre: 'Alba',
  apellidos: 'Moreno',
  email: 'amoreno@gmail.com',
  telefono: '655854765',
  fecha: '2025-10-12',
  hora: '14:00'
}

// CREACIÓN DE LA BASE DE DATOS y MIGRACIÓN DE LAS TABLA MESSAGES Y USERS, ADEMÁS DE CREAR UN USUARIO VÁLIDO CON EL SEED
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
  const bookingMigration = new BookingMigration({ config })
  await bookingMigration.createBookings()
  const userMigration = new UserMigration({ config })
  await userMigration.createUsers()

  const userSeeder = new UserSeeder({ config })
  await userSeeder.createuser()
  const bookingSeeder = new BookingSeeder({ config })
  bookingSeeder.createBooking()

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

// TEST
describe('API /bookings', () => {
  test('should create a booking.', async () => {
    const response = await request(app)
      .post('/bookings')
      .set('_xsrf_token', xsrfToken)
      .set('Cookie', `_xsrf_token=${xsrfToken}`)
      .send(newBooking)
    expect(response.statusCode).toBe(201)
  })

  test('should not create a booking because schema is not valid.', async () => {
    const response = await request(app)
      .post('/bookings')
      .set('_xsrf_token', xsrfToken)
      .set('Cookie', `_xsrf_token=${xsrfToken}`)
      .send(wrongBooking)
    expect(response.statusCode).toBe(422)
  })

  test('should not create a booking because xsrf_token was not sent.', async () => {
    const response = await request(app)
      .post('/bookings')
      .send(newBooking)
    expect(response.statusCode).toBe(403)
  })

  test('should get all bookings.', async () => {
    const response = await request(app)
      .get('/bookings')
      .set('Cookie', jwt)
    expect(response.statusCode).toBe(200)
    bookings = JSON.parse(response.text).data
  })

  test('should not get all bookings because not logged in.', async () => {
    const response = await request(app)
      .get('/bookings')
    expect(response.statusCode).toBe(401)
  })

  test('should get a booking by id.', async () => {
    const response = await request(app)
      .get(`/bookings/${bookings[0].id}`)
      .set('Cookie', jwt)
    expect(response.statusCode).toBe(200)
  })

  test('should not get a booking by id because not found.', async () => {
    const response = await request(app)
      .get('/bookings/1')
      .set('Cookie', jwt)
    expect(response.statusCode).toBe(404)
  })

  test('should not get a booking by id because user is not logged in.', async () => {
    const response = await request(app)
      .get(`/bookings/${bookings[0].id}`)
    expect(response.statusCode).toBe(401)
  })

  test('should update a booking by id', async () => {
    console.log('Estos son los bookings: ', bookings)
    console.log('Esta es la id del booking: ', bookings[0].id)
    const response = await request(app)
      .patch(`/bookings/${bookings[0].id}`)
      .set('_xsrf_token', xsrfTokenAdmin)
      .set('Cookie', [`_xsrf_token=${xsrfTokenAdmin};_lh_tk=${jwtCookie}`])
      .send(updateBooking)
    expect(response.status).toBe(200)
  })

  test('should not update a booking by id because schema is not valid', async () => {
    const response = await request(app)
      .patch(`/bookings/${bookings[0].id}`)
      .set('_xsrf_token', xsrfTokenAdmin)
      .set('Cookie', [`_xsrf_token=${xsrfTokenAdmin};_lh_tk=${jwtCookie}`])
      .send(wrongBooking)
    expect(response.status).toBe(422)
  })

  test('should not update a booking by id because CSRF Protection.', async () => {
    const response = await request(app)
      .patch(`/bookings/${bookings[0].id}`)
      .set('Cookie', jwt)
      .send(updateBooking)
    expect(response.status).toBe(403)
  })

  test('should not update a booking by id because not logged in.', async () => {
    const response = await request(app)
      .patch(`/bookings/${bookings[0].id}`)
      .set('_xsrf_token', xsrfToken)
      .set('Cookie', `_xsrf_token=${xsrfToken}`) // Si no se está logueado debe ir con el csrf token sin jwt
      .send(updateBooking)
    expect(response.status).toBe(401)
  })

  test('should delete a booking by id', async () => {
    const response = await request(app)
      .delete(`/bookings/${bookings[0].id}`)
      .set('_xsrf_token', xsrfTokenAdmin)
      .set('Cookie', [`_xsrf_token=${xsrfTokenAdmin};_lh_tk=${jwtCookie}`])
    expect(response.status).toBe(200)
  })

  test('should not delete a booking by id because not found', async () => {
    const response = await request(app)
      .delete('/bookings/1}')
      .set('_xsrf_token', xsrfTokenAdmin)
      .set('Cookie', [`_xsrf_token=${xsrfTokenAdmin};_lh_tk=${jwtCookie}`])
    expect(response.status).toBe(404)
  })

  test('should not delete a booking by id because CSRF Protection.', async () => {
    const response = await request(app)
      .delete(`/bookings/${bookings[0].id}`)
      .set('Cookie', jwt)
    expect(response.status).toBe(403)
  })

  test('should not delete a booking by id because not logged in.', async () => {
    const response = await request(app)
      .delete(`/bookings/${bookings[0].id}`)
      .set('_xsrf_token', xsrfToken)
      .set('Cookie', `_xsrf_token=${xsrfToken}`)
    expect(response.status).toBe(401)
  })

  test('should delete a selection of bookings.', async () => {
    const idArray = {
      ids: [bookings[1].id, bookings[2].id]
    }
    const response = await request(app)
      .delete('/bookings')
      .set('_xsrf_token', xsrfTokenAdmin)
      .set('Cookie', [`_xsrf_token=${xsrfTokenAdmin};_lh_tk=${jwtCookie}`])
      .send(idArray)
    expect(response.status).toBe(200)
  })

  test('should not delete a selection of bookings because not found.', async () => {
    const idArray = {
      ids: ['1', '2', '3']
    }
    const response = await request(app)
      .delete('/bookings')
      .set('_xsrf_token', xsrfTokenAdmin)
      .set('Cookie', [`_xsrf_token=${xsrfTokenAdmin};_lh_tk=${jwtCookie}`])
      .send(idArray)
    expect(response.status).toBe(404)
  })

  test('should not delete a selection of bookings because CSRF Protection.', async () => {
    const idArray = {
      ids: [bookings[1].id, bookings[2].id]
    }
    const response = await request(app)
      .delete('/bookings')
      .set('Cookie', jwt)
      .send(idArray)
    expect(response.status).toBe(403)
  })

  test('should not delete a selection of bookings because not logged in.', async () => {
    const idArray = {
      ids: [bookings[1].id, bookings[2].id]
    }
    const response = await request(app)
      .delete('/bookings')
      .set('_xsrf_token', xsrfToken)
      .set('Cookie', `_xsrf_token=${xsrfToken}`)
      .send(idArray)
    expect(response.status).toBe(401)
  })
})
