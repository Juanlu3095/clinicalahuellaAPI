import { describe, expect, test, jest, beforeEach } from '@jest/globals'
import 'dotenv/config'

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN, MAIL_AUTH_USER } = process.env

const mockErrorlLogs = jest.fn()
const mockgetAccessToken = jest.fn()
const mockOAuth2 =
  {
    getAccessToken: mockgetAccessToken
  }

const mockCreateTransport = jest.fn(() => ({
  sendMail: mockSendMail
}))
const mockSendMail = jest.fn()

// Mock errorLogs
jest.unstable_mockModule('../../src/services/errorlogs.js', () => ({
  errorLogs: mockErrorlLogs
}))

// Mock GoogleAuthService
jest.unstable_mockModule('../../src/services/GoogleAuthService.js', () => ({
  setOauth2client: jest.fn(() => mockOAuth2)
}))

// MockNodemailer
jest.unstable_mockModule('nodemailer', () => ({
  default: {
    createTransport: mockCreateTransport
  }
}))

// Mock del parámetro que recibe sendEmailAppointment
const mockDataEmail = {
  nombre: 'José',
  apellidos: 'fernández Guerrero',
  email: 'jose@gmail.es',
  fecha: '2025-09-25',
  hora: '12:00'
}

const { sendEmailAppointment } = await import('../../src/services/EmailService.js')

beforeEach(async () => {
  jest.clearAllMocks()
})

describe('EmailService', () => {
  test('should send an email', async () => {
    mockgetAccessToken.mockResolvedValue({ token: 'fake-access-token' })
    await sendEmailAppointment(mockDataEmail)

    expect(mockgetAccessToken).toHaveBeenCalled()
    expect(mockCreateTransport).toHaveBeenCalledWith({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: MAIL_AUTH_USER,
        clientId: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        refreshToken: GOOGLE_REFRESH_TOKEN,
        accessToken: 'fake-access-token'
      }
    })
    expect(mockSendMail).toHaveBeenCalledWith({
      from: '"Clínica veterinaria La Huella" <Clinica La Huella>',
      to: mockDataEmail.email,
      subject: 'Tu cita en La Huella',
      html: `<h2>¡Hola, ${mockDataEmail.nombre} ${mockDataEmail.apellidos}!</h2>
             <p>Te escribimos para confirmarte tu cita en nuestra clínica veterinaria. Aquí te dejamos los datos:</p>
             <p><b>Nombre y apellidos</b>: ${mockDataEmail.nombre} ${mockDataEmail.apellidos}</p>
             <p><b>Fecha</b>: ${new Date(mockDataEmail.fecha).toLocaleDateString()}</p>
             <p><b>Hora</b>: ${mockDataEmail.hora}</p>
             <p>Te esperamos en nuestras instalaciones el dia y la hora indicadas, y si tienes alguna pregunta, no dudes en contactarnos.</p>`
    })
    expect(mockErrorlLogs).not.toHaveBeenCalled()
  })

  test('should not send an email because auth was not valid.', async () => {
    mockgetAccessToken.mockRejectedValue(new Error('Credenciales no válidas'))
    try {
      await sendEmailAppointment(mockDataEmail)
    } catch (error) {
      expect(mockgetAccessToken).toHaveBeenCalled()
      expect(mockCreateTransport).not.toHaveBeenCalled()
      expect(mockSendMail).not.toHaveBeenCalled()
      expect(mockErrorlLogs).toHaveBeenCalledWith(new Error(error).stack)
    }
  })

  test('should not send an email because transporter.sendMail had an error.', async () => {
    mockgetAccessToken.mockResolvedValue({ token: 'fake-access-token' })
    mockCreateTransport.mockResolvedValue('create Transport correcto')
    mockSendMail.mockRejectedValue('send Email incorrecto')

    try {
      await sendEmailAppointment(mockDataEmail)
    } catch (error) {
      expect(mockgetAccessToken).toHaveBeenCalled()
      expect(mockCreateTransport).toHaveBeenCalledWith({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: MAIL_AUTH_USER,
          clientId: GOOGLE_CLIENT_ID,
          clientSecret: GOOGLE_CLIENT_SECRET,
          refreshToken: GOOGLE_REFRESH_TOKEN,
          accessToken: 'fake-access-token'
        }
      })
      expect(mockSendMail).toHaveBeenCalledWith({
        from: '"Clínica veterinaria La Huella" <Clinica La Huella>',
        to: mockDataEmail.email,
        subject: 'Tu cita en La Huella',
        html: `<h2>¡Hola, ${mockDataEmail.nombre} ${mockDataEmail.apellidos}!</h2>
              <p>Te escribimos para confirmarte tu cita en nuestra clínica veterinaria. Aquí te dejamos los datos:</p>
              <p><b>Nombre y apellidos</b>: ${mockDataEmail.nombre} ${mockDataEmail.apellidos}</p>
              <p><b>Fecha</b>: ${new Date(mockDataEmail.fecha).toLocaleDateString()}</p>
              <p><b>Hora</b>: ${mockDataEmail.hora}</p>
              <p>Te esperamos en nuestras instalaciones el dia y la hora indicadas, y si tienes alguna pregunta, no dudes en contactarnos.</p>`
      })
      expect(mockErrorlLogs).toHaveBeenCalledWith(new Error(error).stack)
    }
  })
})
