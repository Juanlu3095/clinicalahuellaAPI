// import { app } from './config/apptest.js'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, test, jest } from '@jest/globals'
import { DatabaseMigration } from '../src/database/migrations/database.js'
import { PostMigration } from '../src/database/migrations/create_posts_table.js'
import { CategoryMigration } from '../src/database/migrations/create_categories_table.js'
import { ImageMigration } from '../src/database/migrations/create_images_table.js'
import { UserMigration } from '../src/database/migrations/create_user_table.js'
import { PostSeeder } from '../src/database/seeders/postseeder.js'
import { CategorySeeder } from '../src/database/seeders/categoryseeder.js'
import { UserSeeder } from '../src/database/seeders/userseeder.js'

let xsrfToken = ''
let xsrfTokenAdmin = ''
let jwt = ''
let jwtCookie = ''
let posts = [] // Los posts creados con el seed y el test con POST
let databasemigration = {}

const newPost = {
  slug: 'slug-de-prueba',
  titulo: 'titulo de prueba',
  contenido: 'Éste el contenido del post',
  categoriaId: 1,
  imagen: null,
  metadescripcion: 'metadescripcion de prueba',
  keywords: 'keywords de prueba',
  estado: 'borrador'
}

const wrongPost = {
  slug: 'slug-de-pruebas',
  titulo: 'titulo de pruebas',
  contenido: 'Éste el contenido de prueba',
  categoriaId: 1,
  imagen: null,
  metadescripcion: 'metadescripcion de prueba',
  keywords: 'keywords de prueba',
  estado: 'prueba'
}

const updatedPost = {
  slug: 'slug-de-prueba',
  titulo: 'titulo de prueba',
  contenido: 'Éste el contenido del post',
  categoriaId: 3,
  imagen: null,
  metadescription: 'metadescripcion de prueba',
  keywords: 'keywords de prueba',
  estado: 'publicado'
}

const wrongUpdatedPost = {
  slug: 'slug-de-pruebas',
  titulo: 'titulo de prueba',
  contenido: 'Éste el contenido del post',
  categoriaId: 3,
  imagen: null,
  metadescription: 'metadescripcion de prueba',
  keywords: 'keywords de prueba',
  estado: 'prueba'
}

// Métodos sin implementación, vacíos, sólo para saber los parámetros que le llegan y cuántas veces han sido llamados. mockReturnValue para definir su retorno
const mockGetFoldersByName = jest.fn()
const mockCreateFolderDrive = jest.fn()
const mockStoreImageDrive = jest.fn()
const mockDeleteImageDrive = jest.fn()
// Reemplazamos el constructor de DriveService
jest.mock('../src/services/DriveService.js', () => {
  return jest.fn().mockImplementation(() => {
    return {
      getFoldersByName: mockGetFoldersByName,
      createFolderDrive: mockCreateFolderDrive,
      storeImageDrive: mockStoreImageDrive,
      deleteImageDrive: mockDeleteImageDrive
    }
  })
})

// Mockeamos database/utilities/validations para que salga o no un error 409
const mockRepeatedValues = jest.fn()
jest.unstable_mockModule('../src/database/utilities/validations.js', () => ({
  repeatedValues: mockRepeatedValues
}))

// jest.unstable_mockModule debe ir antes que la importación de app para que sea compatible con ES Modules
// Además el mock se invoca antes de traernos el app auténtico, viéndose afectado por el mock
const { app } = await import('./config/apptest.js')

// CREACIÓN DE LA BASE DE DATOS y MIGRACIÓN DE LAS TABLAS POSTS Y USERS, ADEMÁS DE CREAR UN USUARIO VÁLIDO CON EL SEED
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
  const postTablemigration = new PostMigration({ config })
  await postTablemigration.createPosts()
  const categoryTableMigration = new CategoryMigration({ config })
  categoryTableMigration.createCategories()
  const imageTableMigration = new ImageMigration({ config })
  await imageTableMigration.createImages()
  const usermigration = new UserMigration({ config })
  await usermigration.createUsers()

  const postSeeder = new PostSeeder({ config })
  await postSeeder.createPost()
  const categorySeeder = new CategorySeeder({ config })
  await categorySeeder.createcategory()
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

// TESTS
describe('API /posts', () => {
  test('should create a post.', async () => {
    mockRepeatedValues.mockReturnValue(0)
    const response = await request(app)
      .post('/posts')
      .set('_xsrf_token', xsrfTokenAdmin)
      .set('Cookie', [`_xsrf_token=${xsrfTokenAdmin};_lh_tk=${jwtCookie}`])
      .send(newPost)
    expect(response.statusCode).toBe(201)
    expect(mockRepeatedValues).toHaveBeenCalledWith('posts', 'slug', newPost.slug)
  })

  test('should not create a post because schema is not valid.', async () => {
    mockRepeatedValues.mockReturnValue(0)
    const response = await request(app)
      .post('/posts')
      .set('_xsrf_token', xsrfTokenAdmin)
      .set('Cookie', [`_xsrf_token=${xsrfTokenAdmin};_lh_tk=${jwtCookie}`])
      .send(wrongPost)
    expect(response.statusCode).toBe(422)
    expect(mockRepeatedValues).not.toHaveBeenCalledWith('posts', 'slug', wrongPost.slug) // No se le llama porque no pasa de la validación del Schema
  })

  test('should not create a post because slug already exists.', async () => {
    mockRepeatedValues.mockReturnValue(1)
    const response = await request(app)
      .post('/posts')
      .set('_xsrf_token', xsrfTokenAdmin)
      .set('Cookie', [`_xsrf_token=${xsrfTokenAdmin};_lh_tk=${jwtCookie}`])
      .send(newPost)
    expect(response.statusCode).toBe(409)
    expect(mockRepeatedValues).toHaveBeenCalledWith('posts', 'slug', newPost.slug)
  })

  test('should not create a post because xsrf_token was not sent.', async () => {
    mockRepeatedValues.mockReturnValue(0)
    const response = await request(app)
      .post('/posts')
      .set('Cookie', jwt)
      .send(newPost)
    expect(response.statusCode).toBe(403)
    expect(mockRepeatedValues).toHaveBeenCalledWith('posts', 'slug', newPost.slug)
  })

  test('should not create a post because user is not logged in.', async () => {
    mockRepeatedValues.mockReturnValue(0)
    const response = await request(app)
      .post('/posts')
      .set('_xsrf_token', xsrfToken)
      .set('Cookie', `_xsrf_token=${xsrfToken}`)
      .send(newPost)
    expect(response.statusCode).toBe(401)
    expect(mockRepeatedValues).toHaveBeenCalledWith('posts', 'slug', newPost.slug)
  })

  test('should get all posts with no updated_at.', async () => {
    const response = await request(app)
      .get('/posts')
    expect(response.statusCode).toBe(200)
    expect(response.body.data[0].updated_at).not.toBeDefined()
    posts = JSON.parse(response.text).data
  })

  test('should get all posts with updated_at.', async () => {
    const response = await request(app)
      .get('/posts')
      .set('Cookie', jwt)
    expect(response.statusCode).toBe(200)
    expect(response.body.data[0].updated_at).toBeDefined()
  })

  test('should get all posts by category.', async () => {
    const response = await request(app)
      .get('/posts?categoria=Perros')
    expect(response.statusCode).toBe(200)
  })

  test('should not get all posts by category.', async () => {
    const response = await request(app)
      .get('/posts?categoria=Gatos')
    expect(response.statusCode).toBe(404)
  })

  test('should get all posts by status.', async () => {
    const response = await request(app)
      .get('/posts?estado=publicado')
    expect(response.statusCode).toBe(200)
  })

  test('should not get all posts because status is not valid.', async () => {
    const response = await request(app)
      .get('/posts?estado=prueba')
    expect(response.statusCode).toBe(404)
  })

  test('should get all posts with limit.', async () => {
    const response = await request(app)
      .get('/posts?estado=borrador&limit=1')
    expect(response.statusCode).toBe(200)
    expect(response.body.data.length).toBe(1)
  })

  test('should get a post by id.', async () => {
    const response = await request(app)
      .get(`/posts/${posts[0].id}`)
    expect(response.statusCode).toBe(200)
  })

  test('should not get a post by id because not found.', async () => {
    const response = await request(app)
      .get('/posts/200')
    expect(response.statusCode).toBe(404)
  })

  test('should get a post by slug.', async () => {
    const response = await request(app)
      .get('/posts/slug/como-adiestrar-a-tu-perro')
    expect(response.statusCode).toBe(200)
    expect(response.body.data[0].updated_at).not.toBeDefined()
  })

  test('should get a post by slug with updated_at.', async () => {
    const response = await request(app)
      .get('/posts/slug/como-adiestrar-a-tu-perro')
      .set('Cookie', jwt)
    expect(response.statusCode).toBe(200)
    expect(response.body.data[0].updated_at).toBeDefined()
  })

  test('should not get a post by id because not found.', async () => {
    const response = await request(app)
      .get('/posts/slug/slug-inventado')
    expect(response.statusCode).toBe(404)
  })

  test('should update a post by id', async () => {
    mockRepeatedValues.mockReturnValue(0)
    const response = await request(app)
      .patch(`/posts/${posts[0].id}`)
      .set('_xsrf_token', xsrfTokenAdmin)
      .set('Cookie', [`_xsrf_token=${xsrfTokenAdmin};_lh_tk=${jwtCookie}`])
      .send(updatedPost)
    expect(response.status).toBe(200)
    expect(mockRepeatedValues).toHaveBeenCalledWith('posts', 'slug', updatedPost.slug)
  })

  test('should not update a post by id because slug already exists', async () => {
    mockRepeatedValues.mockReturnValue(2) // Aquí la regla cambia, debe ser > 1 para que salga el 409
    const response = await request(app)
      .patch(`/posts/${posts[0].id}`)
      .set('_xsrf_token', xsrfTokenAdmin)
      .set('Cookie', [`_xsrf_token=${xsrfTokenAdmin};_lh_tk=${jwtCookie}`])
      .send(updatedPost)
    expect(response.status).toBe(409)
    expect(mockRepeatedValues).toHaveBeenCalledWith('posts', 'slug', updatedPost.slug)
  })

  test('should not update a post by id because schema is not valid', async () => {
    mockRepeatedValues.mockReturnValue(0)
    const response = await request(app)
      .patch(`/posts/${posts[0].id}`)
      .set('_xsrf_token', xsrfTokenAdmin)
      .set('Cookie', [`_xsrf_token=${xsrfTokenAdmin};_lh_tk=${jwtCookie}`])
      .send(wrongUpdatedPost)
    expect(response.status).toBe(422)
    expect(mockRepeatedValues).not.toHaveBeenCalledWith('posts', 'slug', wrongUpdatedPost.slug) // No se le llama porque no pasa de la validación del Schema
  })

  test('should not update a post by id because CSRF Protection.', async () => {
    mockRepeatedValues.mockReturnValue(0)
    const response = await request(app)
      .patch(`/posts/${posts[0].id}`)
      .set('Cookie', jwt)
      .send(updatedPost)
    expect(response.status).toBe(403)
    expect(mockRepeatedValues).toHaveBeenCalledWith('posts', 'slug', updatedPost.slug)
  })

  test('should not update a post by id because not logged in.', async () => {
    mockRepeatedValues.mockReturnValue(0)
    const response = await request(app)
      .patch(`/posts/${posts[0].id}`)
      .set('_xsrf_token', xsrfToken)
      .set('Cookie', `_xsrf_token=${xsrfToken}`) // Si no se está logueado debe ir con el csrf token sin jwt
      .send(updatedPost)
    expect(response.status).toBe(401)
    expect(mockRepeatedValues).toHaveBeenCalledWith('posts', 'slug', updatedPost.slug)
  })

  test('should delete a post by id', async () => {
    const response = await request(app)
      .delete(`/posts/${posts[0].id}`)
      .set('_xsrf_token', xsrfTokenAdmin)
      .set('Cookie', [`_xsrf_token=${xsrfTokenAdmin};_lh_tk=${jwtCookie}`])
    expect(response.status).toBe(200)
  })

  test('should not delete a post by id because not found', async () => {
    const response = await request(app)
      .delete('/posts/50}')
      .set('_xsrf_token', xsrfTokenAdmin)
      .set('Cookie', [`_xsrf_token=${xsrfTokenAdmin};_lh_tk=${jwtCookie}`])
    expect(response.status).toBe(404)
  })

  test('should not delete a post by id because CSRF Protection.', async () => {
    const response = await request(app)
      .delete(`/posts/${posts[0].id}`)
      .set('Cookie', jwt)
    expect(response.status).toBe(403)
  })

  test('should not delete a post by id because not logged in.', async () => {
    const response = await request(app)
      .delete(`/posts/${posts[0].id}`)
      .set('_xsrf_token', xsrfToken)
      .set('Cookie', `_xsrf_token=${xsrfToken}`)
    expect(response.status).toBe(401)
  })

  test('should delete a selection of posts.', async () => {
    const idArray = {
      ids: [posts[1].id, posts[2].id]
    }
    const response = await request(app)
      .delete('/posts')
      .set('_xsrf_token', xsrfTokenAdmin)
      .set('Cookie', [`_xsrf_token=${xsrfTokenAdmin};_lh_tk=${jwtCookie}`])
      .send(idArray)
    expect(response.status).toBe(200)
  })

  test('should not delete a selection of posts because not found.', async () => {
    const idArray = {
      ids: ['10', '20']
    }
    const response = await request(app)
      .delete('/posts')
      .set('_xsrf_token', xsrfTokenAdmin)
      .set('Cookie', [`_xsrf_token=${xsrfTokenAdmin};_lh_tk=${jwtCookie}`])
      .send(idArray)
    expect(response.status).toBe(404)
  })

  test('should not delete a selection of posts because CSRF Protection.', async () => {
    const idArray = {
      ids: [posts[1].id, posts[2].id]
    }
    const response = await request(app)
      .delete('/posts')
      .set('Cookie', jwt)
      .send(idArray)
    expect(response.status).toBe(403)
  })

  test('should not delete a selection of posts because not logged in.', async () => {
    const idArray = {
      ids: [posts[1].id, posts[2].id]
    }
    const response = await request(app)
      .delete('/posts')
      .set('_xsrf_token', xsrfToken)
      .set('Cookie', `_xsrf_token=${xsrfToken}`)
      .send(idArray)
    expect(response.status).toBe(401)
  })
})
