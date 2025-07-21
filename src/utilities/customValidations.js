/**
 * @param {string} dni DNI to verify
 * @returns {boolean} Either if the value provided is valid or not
 */
export const isValidDni = (dni) => {
  if (dni.length !== 9) return false

  const dniLetters = 'TRWAGMYFPDXBNJZSQVHLCKE'
  const letter = dni.substring(8)
  const numbers = dni.substring(0, 8)

  const regex = /^[0-9]*$/
  const onlyNumbers = regex.test(numbers) // Comprueba que numbers sólo tiene números
  if (!onlyNumbers) return false

  if (dniLetters.charAt(numbers % 23) === letter.toUpperCase() && letter.length === 1 && numbers.length === 8) {
    return true
  }
  return false
}
