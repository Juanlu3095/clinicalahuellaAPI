import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { validateLogin } from '../schemas/LoginSchema.js'

export class AuthController {
  constructor ({ UserModel }) {
    this.userModel = UserModel
  }

  // Comprueba si el usuario está logueado comprobando el JWT en las cookies.
  getLogin = (req, res) => {
    const jwtToken = req.cookies._lh_tk

    if (!jwtToken) {
      return res.status(401).json({ error: 'El usuario no está autenticado.' })
    }

    const { JWT_SECRET } = process.env

    try {
      jwt.verify(jwtToken, JWT_SECRET)
      return res.send({ message: 'El usuario está autenticado.' })
    } catch (error) {
      return res.status(401).json({ error: 'El usuario no está autenticado o la sesión expiró.' })
    }
  }

  // Realiza el inicio de sesión.
  login = async (req, res) => {
    const validation = validateLogin(req.body) // Valida los input con el Schema

    if (!validation.success) {
      return res.status(422).json({ error: JSON.parse(validation.error.message) })
    }

    const user = await this.userModel.getUserByEmail({ email: validation.data.email })
    if (user.length === 0) {
      return res.status(401).json({ error: 'Usuario y/o contraseña incorrectos.' }) // El email no es correcto
    }

    const validarPass = await bcrypt.compare(validation.data.password, user.password) // COMPROBAR SI ES NECESARIO TRY/CATCH
    if (!validarPass) {
      return res.status(401).json({ error: 'Usuario y/o contraseña incorrectos.' })
    }

    const { JWT_SECRET } = process.env
    const token = jwt.sign({ user: `${user.nombre} ${user.apellidos}` }, JWT_SECRET, { expiresIn: '1h' })

    res.cookie('_lh_tk', token, {
      httpOnly: true, // La cookie sólo se puede acceder en el servidor
      secure: true, // La cookie sólo se puede acceder en HTTPS. Si ENVIRONMENT es 'production' sale true
      sameSite: 'none', // Sólo se puede acceder desde el mismo dominio ?
      maxAge: 1000 * 60 * 60 // Validez máxima de 1 hora de la cookie
    }).json({ message: 'Usuario y contraseña correctos.', data: `${user.nombre} ${user.apellidos}` })
  }

  // Cierra la sesión eliminando además la cookie del navegador.
  logout = (req, res) => {
    const jwtToken = req.cookies._lh_tk

    if (!jwtToken) {
      return res.status(401).json({ error: 'El usuario no está autenticado.' })
    }

    const { JWT_SECRET } = process.env

    try {
      jwt.verify(jwtToken, JWT_SECRET)
      return res.clearCookie('_lh_tk', {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 1000 * 60 * 60
      }).send({ message: 'Cierre de sesión satisfactorio.' }) // Envía un HEADER con: 'set-cookie': [ '_lh_tk=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT' ]
    } catch (error) {
      return res.status(401).json({ error: 'El usuario no está autenticado o la sesión expiró.' })
    }
  }
}
