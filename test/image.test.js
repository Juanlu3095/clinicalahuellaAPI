import { app } from './config/apptest.js'
import request from 'supertest'
import { describe, expect, test } from '@jest/globals'

describe('API /images', () => {
  test('should get the file by name.', async () => {
    const response = await request(app)
      .get('/images/usuario.png')
    expect(response.status).toBe(200)
    expect(response.header['content-type']).toBe('image/png')
    expect(response.body).toBeInstanceOf(Buffer)
  })

  test('should not get the file by name because it was not found.', async () => {
    const response = await request(app)
      .get('/images/usuario.jpg')
    expect(response.status).toBe(404)
  })
})
