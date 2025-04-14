import z from 'zod'

const Booking = z.object({
  nombre: z.string({ required_error: 'El campo nombre es requerido.', invalid_type_error: 'El campo nombre debe ser un string.' }),
  apellidos: z.string({ required_error: 'El campo apellidos es requerido.', invalid_type_error: 'El campo apellidos debe ser un string.' }),
  email: z.string({ required_error: 'El campo email es requerido.', invalid_type_error: 'El campo email debe ser un string.' }).email({ message: 'El campo email debe ser un email.' }),
  telefono: z.number({ required_error: 'El campo telefono es requerido.', invalid_type_error: 'El campo telefono debe ser un número.' }).int({ message: 'El campo telefono debe ser un entero.' }).positive({ message: 'El campo telefono no debe ser negativo.' }),
  fecha: z.string().date({ required_error: 'El campo fecha es requerido.', invalid_type_error: 'El campo fecha debe ser una fecha en formato YYYY-MM-DD' }),
  hora: z.string({ required_error: 'El campo hora es requerido.' }).regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, 'El campo hora debe ser una fecha en formato HH-MM o HH-MM-SS')
})

// Podríamos desestructurar para decirle a la función qué campos vamos a validar exactamente: const Validate = ({ username = "Pepe", ... }) => ...

export const validateBooking = (booking) => {
  return Booking.required().safeParse(booking)
}

export const validatePartialBooking = (booking) => {
  return Booking.partial().safeParse(booking)
}
