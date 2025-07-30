import { app } from '../config/apptest.js'
import request from 'supertest'
import { describe, expect, test } from '@jest/globals'

describe('API /csrf', () => {
  test('it should get csrf cookie', async () => {
    const response = await request(app)
      .get('/csrf')
    expect(response.status).toBe(200)
    expect(JSON.parse(response.text)).toEqual({ message: 'Token generado con éxito.' })
    expect(response.header['set-cookie'][0]).toContain('_xsrf_token=')
  })
})
