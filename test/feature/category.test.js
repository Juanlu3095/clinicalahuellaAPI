import { app } from '../config/apptest.js'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, test } from '@jest/globals'
import { DatabaseMigration } from '../../src/database/migrations/database.js'
import { CategoryMigration } from '../../src/database/migrations/create_categories_table.js'
import { UserMigration } from '../../src/database/migrations/create_user_table.js'
import { UserSeeder } from '../../src/database/seeders/userseeder.js'
import { CategorySeeder } from '../../src/database/seeders/categoryseeder.js'

let xsrfToken = ''
let xsrfTokenAdmin = ''
let jwt = ''
let jwtCookie = ''
let categories = [] // Los mensajes creados con el seed y el test con POST
let databasemigration = {}

const newCategory = {
  nombre: 'Animales'
}

const updatedCategory = {
  nombre: 'Cuidados'
}

const wrongCategory = {
  nombre: ''
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
  const categorymigration = new CategoryMigration({ config })
  await categorymigration.createCategories()
  const usermigration = new UserMigration({ config })
  await usermigration.createUsers()

  const userSeeder = new UserSeeder({ config })
  await userSeeder.createuser()
  const categorySeeder = new CategorySeeder({ config })
  categorySeeder.createcategory()

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
describe('API /categories', () => {
  test('should create a category.', async () => {
    const response = await request(app)
      .post('/categories')
      .set('_xsrf_token', xsrfTokenAdmin)
      .set('Cookie', [`_xsrf_token=${xsrfTokenAdmin};_lh_tk=${jwtCookie}`])
      .send(newCategory)
    expect(response.statusCode).toBe(201)
    expect(response.body).toEqual({ message: 'Categoría creada.' })
  })

  test('should not create a category because schema is not valid.', async () => {
    const response = await request(app)
      .post('/categories')
      .set('_xsrf_token', xsrfTokenAdmin)
      .set('Cookie', [`_xsrf_token=${xsrfTokenAdmin};_lh_tk=${jwtCookie}`])
      .send(wrongCategory)
    expect(response.statusCode).toBe(422)
  })

  test('should not create a category because there is no name of category.', async () => {
    const response = await request(app)
      .post('/categories')
      .set('_xsrf_token', xsrfTokenAdmin)
      .set('Cookie', [`_xsrf_token=${xsrfTokenAdmin};_lh_tk=${jwtCookie}`])
      .send()
    expect(response.statusCode).toBe(422)
  })

  test('should not create a category because xsrf_token was not sent.', async () => {
    const response = await request(app)
      .post('/categories')
      .set('Cookie', jwt) // jwt es lo mismo que `_lh_tk=${jwtCookie}`
      .send(newCategory)
    expect(response.statusCode).toBe(403)
  })

  test('should not create a category because user is not logged in', async () => {
    const response = await request(app)
      .post('/categories')
      .set('_xsrf_token', xsrfToken)
      .set('Cookie', `_xsrf_token=${xsrfToken}`)
      .send(newCategory)
      .catch(error => {
        console.error('Error: ', error)
      })
    expect(response.statusCode).toBe(401)
  })

  test('should get all categories.', async () => {
    const response = await request(app)
      .get('/categories')
    expect(response.statusCode).toBe(200)
    categories = JSON.parse(response.text).data
  })

  test('should get a category by id.', async () => {
    const response = await request(app)
      .get(`/categories/${categories[0].id}`)
    expect(response.statusCode).toBe(200)
  })

  test('should not get a category by id because not found.', async () => {
    const response = await request(app)
      .get('/categories/55')
    expect(response.statusCode).toBe(404)
  })

  test('should update a category by id', async () => {
    const response = await request(app)
      .patch(`/categories/${categories[0].id}`)
      .set('_xsrf_token', xsrfTokenAdmin)
      .set('Cookie', [`_xsrf_token=${xsrfTokenAdmin};_lh_tk=${jwtCookie}`])
      .send(updatedCategory)
    expect(response.status).toBe(200)
  })

  test('should not update a category by id because schema is not valid', async () => {
    const response = await request(app)
      .patch(`/categories/${categories[0].id}`)
      .set('_xsrf_token', xsrfTokenAdmin)
      .set('Cookie', [`_xsrf_token=${xsrfTokenAdmin};_lh_tk=${jwtCookie}`])
      .send(wrongCategory)
    expect(response.status).toBe(422)
  })

  test('should not update a category by id because CSRF Protection.', async () => {
    const response = await request(app)
      .patch(`/categories/${categories[0].id}`)
      .set('Cookie', jwt)
      .send(updatedCategory)
    expect(response.status).toBe(403)
  })

  test('should not update a category by id because not logged in.', async () => {
    const response = await request(app)
      .patch(`/categories/${categories[0].id}`)
      .set('_xsrf_token', xsrfToken)
      .set('Cookie', `_xsrf_token=${xsrfToken}`) // Si no se está logueado debe ir con el csrf token sin jwt
      .send(updatedCategory)
    expect(response.status).toBe(401)
  })

  test('should delete a category by id', async () => {
    const response = await request(app)
      .delete(`/categories/${categories[0].id}`)
      .set('_xsrf_token', xsrfTokenAdmin)
      .set('Cookie', [`_xsrf_token=${xsrfTokenAdmin};_lh_tk=${jwtCookie}`])
    expect(response.status).toBe(200)
  })

  test('should not delete a message by id because not found', async () => {
    const response = await request(app)
      .delete('/categories/55}')
      .set('_xsrf_token', xsrfTokenAdmin)
      .set('Cookie', [`_xsrf_token=${xsrfTokenAdmin};_lh_tk=${jwtCookie}`])
    expect(response.status).toBe(404)
  })

  test('should not delete a message by id because CSRF Protection.', async () => {
    const response = await request(app)
      .delete(`/categories/${categories[0].id}`)
      .set('Cookie', jwt)
    expect(response.status).toBe(403)
  })

  test('should not delete a message by id because not logged in.', async () => {
    const response = await request(app)
      .delete(`/categories/${categories[0].id}`)
      .set('_xsrf_token', xsrfToken)
      .set('Cookie', `_xsrf_token=${xsrfToken}`)
    expect(response.status).toBe(401)
  })

  test('should delete a selection of categories.', async () => {
    const idArray = {
      ids: [categories[1].id, categories[2].id, categories[3].id]
    }
    const response = await request(app)
      .delete('/categories')
      .set('_xsrf_token', xsrfTokenAdmin)
      .set('Cookie', [`_xsrf_token=${xsrfTokenAdmin};_lh_tk=${jwtCookie}`])
      .send(idArray)
    expect(response.status).toBe(200)
  })

  test('should not delete a selection of categories because not found.', async () => {
    const idArray = {
      ids: [55, 56, 57]
    }
    const response = await request(app)
      .delete('/categories')
      .set('_xsrf_token', xsrfTokenAdmin)
      .set('Cookie', [`_xsrf_token=${xsrfTokenAdmin};_lh_tk=${jwtCookie}`])
      .send(idArray)
    expect(response.status).toBe(404)
  })

  test('should not delete a selection of categories because CSRF Protection.', async () => {
    const idArray = {
      ids: [categories[1].id, categories[2].id, categories[3].id]
    }
    const response = await request(app)
      .delete('/categories')
      .set('Cookie', jwt)
      .send(idArray)
    expect(response.status).toBe(403)
  })

  test('should not delete a selection of categories because not logged in.', async () => {
    const idArray = {
      ids: [categories[1].id, categories[2].id, categories[3].id]
    }
    const response = await request(app)
      .delete('/categories')
      .set('_xsrf_token', xsrfToken)
      .set('Cookie', `_xsrf_token=${xsrfToken}`)
      .send(idArray)
    expect(response.status).toBe(401)
  })
})
