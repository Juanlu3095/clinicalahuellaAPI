import { generateCsrfToken } from '../middlewares/csrf.js'

export class CsrfController {
  getCsrf = (req, res) => {
    generateCsrfToken(req, res, { overwrite: true }) // Crea y envia la cookie con el CSRF Token
    return res.json({ message: 'Token generado con éxito.' })
  }
}
