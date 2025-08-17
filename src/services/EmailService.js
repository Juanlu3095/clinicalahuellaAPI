import nodemailer from 'nodemailer'
import { errorLogs } from './errorlogs.js'
import { setOauth2client } from './GoogleAuthService.js'

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN
const MAIL = process.env.MAIL_AUTH_USER

/**
 * Allows to send and email to client when an appointment is created
 * @param {string} email The email this mail is sent to.
 */
export const sendEmailAppointment = async (data) => {
  try {
    const { token } = await setOauth2client().getAccessToken()

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: MAIL,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: token // Se necesita googleapi para obtener el accessToken
      }
    })

    const fecha = new Date(data.fecha).toLocaleDateString()

    await transporter.sendMail({
      from: '"Clínica veterinaria La Huella" <Clinica La Huella>',
      to: data.email,
      subject: 'Tu cita en La Huella',
      html: `<h2>¡Hola, ${data.nombre} ${data.apellidos}!</h2>
             <p>Te escribimos para confirmarte tu cita en nuestra clínica veterinaria. Aquí te dejamos los datos:</p>
             <p><b>Nombre y apellidos</b>: ${data.nombre} ${data.apellidos}</p>
             <p><b>Fecha</b>: ${fecha}</p>
             <p><b>Hora</b>: ${data.hora}</p>
             <p>Te esperamos en nuestras instalaciones el dia y la hora indicadas, y si tienes alguna pregunta, no dudes en contactarnos.</p>`
    })
  } catch (error) {
    error instanceof Error ? await errorLogs(error.stack) : await errorLogs(new Error(error).stack)
    console.error(error)
  }
}
