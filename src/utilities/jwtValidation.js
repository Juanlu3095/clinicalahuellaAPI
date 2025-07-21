import jwt from 'jsonwebtoken'

/**
 * It returns true if JWT Token provided is valid or false if not
 * @param {string} jwtToken The JWT Token to validate
 * @returns {boolean}
 */
export const isValidJwt = (jwtToken) => {
  if (!jwtToken) {
    return false
  }
  const { JWT_SECRET } = process.env

  try {
    jwt.verify(jwtToken, JWT_SECRET)
    return true
  } catch (error) {
    console.error(error)
    return false
  }
}
