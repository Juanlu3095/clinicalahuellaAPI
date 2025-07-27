// import { app } from './config/apptest.js'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, jest, test } from '@jest/globals'
import { DatabaseMigration } from '../src/database/migrations/database.js'
import { UserMigration } from '../src/database/migrations/create_user_table.js'
import { UserSeeder } from '../src/database/seeders/userseeder.js'
import { AppointmentMigration } from '../src/database/migrations/create_appointment_table.js'
import { AppointmentSeeder } from '../src/database/seeders/appointmentseeder.js'

let xsrfToken = ''
let xsrfTokenAdmin = ''
let jwt = ''
let jwtCookie = ''
let appointments = []
let databasemigration = {}

const newAppointment = {
  nombre: 'Alba',
  apellidos: 'Moreno',
  email: 'jdevtoday25@gmail.com',
  telefono: '655854770',
  fecha: '2025-09-25',
  hora: '12:00'
}

const wrongAppointment = {
  nombre: 'Alba',
  apellidos: 'Moreno',
  email: 'amoreno@gmail.com',
  telefono: 655854770,
  fecha: '2025-09-25',
  hora: '12:00'
}

const updatedAppointment = {
  nombre: 'Alba',
  apellidos: 'Moreno',
  email: 'amoreno@gmail.com',
  telefono: '655854765',
  fecha: '2025-10-12',
  hora: '14:00'
}

// https://stackoverflow.com/questions/78428523/jest-mock-typeerror-cannot-assign-to-read-only-property
// https://archive.jestjs.io/docs/es-es/next/es6-class-mocks
const mockEmailAppointment = jest.fn().mockResolvedValue('Mensaje enviado.')
jest.unstable_mockModule('../src/services/EmailService.js', () => ({
  sendEmailAppointment: mockEmailAppointment
}))

// jest.unstable_mockModule debe ir antes que la importación de app para que sea compatible con ES Modules
// Además el mock se invoca antes de traernos el app auténtico, viéndose afectado por el mock
const { app } = await import('./config/apptest.js')

// CREACIÓN DE LA BASE DE DATOS y MIGRACIÓN DE LAS TABLAS APPOINTMENTS Y USERS, ADEMÁS DE CREAR UN USUARIO VÁLIDO CON EL SEED
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
  const appointmentMigration = new AppointmentMigration({ config })
  await appointmentMigration.createAppointments()
  const userMigration = new UserMigration({ config })
  await userMigration.createUsers()

  const userSeeder = new UserSeeder({ config })
  await userSeeder.createuser()
  const appointmentSeeder = new AppointmentSeeder({ config })
  appointmentSeeder.createAppointment()

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

describe('API /appointments', () => {
  test('should create an appointment.', async () => {
    const response = await request(app)
      .post('/appointments')
      .set('_xsrf_token', xsrfTokenAdmin)
      .set('Cookie', [`_xsrf_token=${xsrfTokenAdmin};_lh_tk=${jwtCookie}`])
      .send(newAppointment)
    expect(response.statusCode).toBe(201)
    expect(mockEmailAppointment).toHaveBeenCalledWith(newAppointment)
  })

  test('should not create an appointment because schema is not valid.', async () => {
    const response = await request(app)
      .post('/appointments')
      .set('_xsrf_token', xsrfTokenAdmin)
      .set('Cookie', [`_xsrf_token=${xsrfTokenAdmin};_lh_tk=${jwtCookie}`])
      .send(wrongAppointment)
    expect(response.statusCode).toBe(422)
  })

  test('should not create an appointment because xsrf_token was not sent.', async () => {
    const response = await request(app)
      .post('/appointments')
      .set('Cookie', jwt) // jwt es lo mismo que `_lh_tk=${jwtCookie}`
      .send(newAppointment)
    expect(response.statusCode).toBe(403)
  })

  test('should not create an appointment because user is not logged in', async () => {
    const response = await request(app)
      .post('/appointments')
      .set('_xsrf_token', xsrfToken)
      .set('Cookie', `_xsrf_token=${xsrfToken}`)
      .send(newAppointment)
      .catch(error => {
        console.error('Error: ', error)
      })
    expect(response.statusCode).toBe(401)
  })

  test('should get all appointments.', async () => {
    const response = await request(app)
      .get('/appointments')
      .set('Cookie', jwt)
    expect(response.statusCode).toBe(200)
    appointments = JSON.parse(response.text).data
  })

  test('should not get all appointments because not logged in.', async () => {
    const response = await request(app)
      .get('/appointments')
    expect(response.statusCode).toBe(401)
  })

  test('should get an appointment by id.', async () => {
    const response = await request(app)
      .get(`/appointments/${appointments[0].id}`)
      .set('Cookie', jwt)
    expect(response.statusCode).toBe(200)
  })

  test('should not get an appointment by id because not found.', async () => {
    const response = await request(app)
      .get('/appointments/1')
      .set('Cookie', jwt)
    expect(response.statusCode).toBe(404)
  })

  test('should not get an appointment by id because user is not logged in.', async () => {
    const response = await request(app)
      .get(`/appointments/${appointments[0].id}`)
    expect(response.statusCode).toBe(401)
  })

  test('should update an appointment by id', async () => {
    const response = await request(app)
      .patch(`/appointments/${appointments[0].id}`)
      .set('_xsrf_token', xsrfTokenAdmin)
      .set('Cookie', [`_xsrf_token=${xsrfTokenAdmin};_lh_tk=${jwtCookie}`])
      .send(updatedAppointment)
    expect(response.status).toBe(200)
  })

  test('should not update an appointment by id because schema is not valid', async () => {
    const response = await request(app)
      .patch(`/appointments/${appointments[0].id}`)
      .set('_xsrf_token', xsrfTokenAdmin)
      .set('Cookie', [`_xsrf_token=${xsrfTokenAdmin};_lh_tk=${jwtCookie}`])
      .send(wrongAppointment)
    expect(response.status).toBe(422)
  })

  test('should not update an appointment by id because CSRF Protection.', async () => {
    const response = await request(app)
      .patch(`/appointments/${appointments[0].id}`)
      .set('Cookie', jwt)
      .send(updatedAppointment)
    expect(response.status).toBe(403)
  })

  test('should not update an appointment by id because not logged in.', async () => {
    const response = await request(app)
      .patch(`/appointments/${appointments[0].id}`)
      .set('_xsrf_token', xsrfToken)
      .set('Cookie', `_xsrf_token=${xsrfToken}`) // Si no se está logueado debe ir con el csrf token sin jwt
      .send(updatedAppointment)
    expect(response.status).toBe(401)
  })

  test('should delete an appointment by id', async () => {
    const response = await request(app)
      .delete(`/appointments/${appointments[0].id}`)
      .set('_xsrf_token', xsrfTokenAdmin)
      .set('Cookie', [`_xsrf_token=${xsrfTokenAdmin};_lh_tk=${jwtCookie}`])
    expect(response.status).toBe(200)
  })

  test('should not delete an appointment by id because not found', async () => {
    const response = await request(app)
      .delete('/appointments/1}')
      .set('_xsrf_token', xsrfTokenAdmin)
      .set('Cookie', [`_xsrf_token=${xsrfTokenAdmin};_lh_tk=${jwtCookie}`])
    expect(response.status).toBe(404)
  })

  test('should not delete an appointment by id because CSRF Protection.', async () => {
    const response = await request(app)
      .delete(`/appointments/${appointments[0].id}`)
      .set('Cookie', jwt)
    expect(response.status).toBe(403)
  })

  test('should not delete an appointment by id because not logged in.', async () => {
    const response = await request(app)
      .delete(`/appointments/${appointments[0].id}`)
      .set('_xsrf_token', xsrfToken)
      .set('Cookie', `_xsrf_token=${xsrfToken}`)
    expect(response.status).toBe(401)
  })
})
