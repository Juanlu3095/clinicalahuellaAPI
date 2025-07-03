export const generateCsrf = () => {

}

export const verifyCsrf = (headers) => {
  if (headers._xsrf_token) {
    console.log('Éste es el CSRF: ', headers._xsrf_token)
    return true
  }
  return false
}
