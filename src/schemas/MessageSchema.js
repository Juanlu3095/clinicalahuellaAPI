import z from 'zod'

const Message = z.object({
  nombre: z.string({ required_error: 'El campo nombre es requerido.', invalid_type_error: 'El campo nombre debe ser un string.' }),
  apellidos: z.string({ required_error: 'El campo apellidos es requerido.', invalid_type_error: 'El campo apellidos debe ser un string.' }),
  email: z.string({ required_error: 'El campo email es requerido.', invalid_type_error: 'El campo email debe ser un string.' }).email({ message: 'El campo debe ser un email.' }),
  telefono: z.string({ required_error: 'El campo telefono es requerido.', invalid_type_error: 'El campo telefono debe ser un string.' }),
  asunto: z.string({ required_error: 'El campo asunto es requerido.', invalid_type_error: 'El campo asunto debe ser un string.' }),
  mensaje: z.string({ required_error: 'El campo mensaje es requerido.', invalid_type_error: 'El campo mensaje debe ser un string.' })
})

// Todos los campos son obligatorios
export const validateMessage = (message) => {
  return Message.required().safeParse(message)
}

// Todos los campos son opcionales. Sólo se validarán aquellos campos que se indiquen
export const validatePartialMessage = (message) => {
  return Message.partial({
    telefono: true,
    asunto: true
  }).safeParse(message)
}
