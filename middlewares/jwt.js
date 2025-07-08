import jwt from 'jsonwebtoken'

export const verifyJwt = (req, res, next) => {
  const jwtToken = req.cookies._lh_tk

  if (!jwtToken) {
    return res.status(401).json({ error: 'El usuario no está autenticado.' })
  }

  const { JWT_SECRET } = process.env

  try {
    jwt.verify(jwtToken, JWT_SECRET)
    next()
  } catch (error) {
    return res.status(401).json({ error: 'El usuario no está autenticado o la sesión expiró.' })
  }
}
