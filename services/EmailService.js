import 'dotenv/config'
import nodemailer from 'nodemailer'
import { google } from 'googleapis'
import { errorLogs } from './errorlogs.js'

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN
const REDIRECT_URL = 'https://developers.google.com/oauthplayground/'
const MAIL = process.env.MAIL_AUTH_USER

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL)

oauth2Client.setCredentials({
  refresh_token: REFRESH_TOKEN
})

const { token } = await oauth2Client.getAccessToken()

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: MAIL,
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: REFRESH_TOKEN,
    accessToken: token // Se necesita googleapi para obtener el accessToken
  }
})

/**
 * Allows to send and email to client when an appointment is created
 * @param {string} email The email this mail is sent to.
 */
export const sendEmailAppointment = async (data) => {
  const fecha = new Date(data.fecha).toLocaleDateString()
  try {
    await transporter.sendMail({
      from: '"Clínica veterinaria La Huella" <Clinica La Huella>',
      to: data.email,
      subject: 'Tu cita en La Huella',
      html: `<h1>¡Hola, ${data.nombre} ${data.apellidos}!</h1>
             <p>Te escribimos para confirmarte tu cita en nuestra clínica veterinaria. Aquí te dejamos los datos:</p>
             <p><b>Nombre y apellidos</b>: ${data.nombre} ${data.apellidos}</p>
             <p><b>Fecha</b>: ${fecha}</p>
             <p><b>Hora</b>: ${data.hora}</p>
             <p>Te esperamos en nuestras instalaciones el dia y la hora indicadas, y si tienes alguna pregunta, no dudes en contactarnos.</p>`
    })
  } catch (error) {
    if (error instanceof Error) {
      errorLogs(error.stack)
    }
  }
}
