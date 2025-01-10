import z from 'zod'

const Booking = z.object({
  nombre: z.string({ required_error: 'El campo nombre es requerido.', invalid_type_error: 'El campo nombre debe ser un string.' }),
  apellidos: z.string({ required_error: 'El campo apellidos es requerido.', invalid_type_error: 'El campo apellidos debe ser un string.' }),
  email: z.string({ required_error: 'El campo email es requerido.', invalid_type_error: 'El campo email debe ser un string.' }).email({ message: 'El campo debe ser un email.' }),
  telefono: z.number({ required_error: 'El campo telefono es requerido.', invalid_type_error: 'El campo telefono debe ser un número.' }).int().positive(),
  fecha: z.string().date({ required_error: 'El campo fecha es requerido.', invalid_type_error: 'El campo fecha debe ser una fecha en formato YYYY-MM-DD' }),
  hora: z.string().time({ required_error: 'El campo hora es requerido.', invalid_type_error: 'El campo hora debe ser una hora en formato HH-MM-SS' })
})

// Podríamos desestructurar para decirle a la función qué campos vamos a validar exactamente: const Validate = ({ username = "Pepe", ... }) => ...

export const validateBooking = (booking) => {
  return Booking.required().safeParse(booking)
}

export const validatePartialBooking = (booking) => {
  return Booking.partial().safeParse(booking)
}
