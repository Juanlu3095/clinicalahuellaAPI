import { doubleCsrf } from 'csrf-csrf'
import crypto from 'node:crypto'

const id = crypto.randomBytes(32).toString('base64') // Se usará en caso de un usuario no autenticado
const { CSRF_SECRET } = process.env

export const {
  generateCsrfToken, // Use this in your routes to provide a CSRF hash + token cookie and token.
  doubleCsrfProtection // This is the default CSRF protection middleware.
} = doubleCsrf({
  cookieName: '_xsrf_token',
  cookieOptions: {
    secure: true,
    sameSite: 'strict',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 // 1 hora dura la cookie
  },
  getSecret: () => CSRF_SECRET,
  getCsrfTokenFromRequest: (req) => req.headers._xsrf_token, // Indica de donde se obtiene el token para CSRF Protection
  getSessionIdentifier: (req) => req.cookies._lh_tk ?? id // Se debe pasar el JWT para las sesiones
})
