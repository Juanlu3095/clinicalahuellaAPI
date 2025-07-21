import { google } from 'googleapis'

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN
const REDIRECT_URL = 'https://developers.google.com/oauthplayground/'

// Devolvemos el oauth2client con las credenciales ya añadidas
// Devolvemos esto y no el accessToken ya que EmailService usa una libreria externa (nodemailer) para el envío de emails y es necesario establecer el accessToken manualmente
export const setOauth2client = () => {
  const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL)

  oauth2Client.setCredentials({
    refresh_token: REFRESH_TOKEN
  })

  return oauth2Client
}
