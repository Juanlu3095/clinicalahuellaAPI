// const myUrl = new URL(req.connection.encrypted ? 'https' : 'http' + '://' + req.headers.referrer + req.url)

/**
 * Booking object
 * @property {object} booking
 *
 * Array of bookings
 * @property {array} bookings
 *
 * It contains the request's complete url
 * @property {string} requestUrl
 */

export class BookingResource {
  // Devolvemos la reserva con datos personalizados
  static protected = (booking, requestUrl) => {
    if (requestUrl === process.env.FRONT_ADMIN_URL) {
      return booking
    } else {
      const protectedBooking = {
        id: booking[0].id,
        nombre: booking[0].nombre,
        apellidos: booking[0].apellidos,
        email: booking[0].email,
        telefono: booking[0].telefono,
        fecha: booking[0].fecha,
        hora: booking[0].hora
      }

      return protectedBooking
    }
  }

  // Lo mismo de arriba pero para arrays
  static protectedArray = (bookings, requestUrl) => {
    if (requestUrl === process.env.FRONT_ADMIN_URL) {
      return bookings
    } else {
      const protectedBooking = []
      bookings.forEach(booking => {
        protectedBooking.push({
          id: booking.id,
          nombre: booking.nombre,
          apellidos: booking.apellidos,
          email: booking.email,
          telefono: booking.telefono,
          fecha: booking.fecha,
          hora: booking.hora
        })
      })
      return protectedBooking
    }
  }
}
