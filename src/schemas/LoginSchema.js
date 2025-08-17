import z from 'zod'

const Login = z.object({
  email: z.string({ required_error: 'El campo email es requerido.', invalid_type_error: 'El campo email debe ser un string.' }).email({ message: 'El campo debe ser un email.' }),
  password: z.string({ required_error: 'El campo password es requerido.', invalid_type_error: 'El campo password debe ser un string.' })
})

// Todos los campos son obligatorios
export const validateLogin = (login) => {
  return Login.required().safeParse(login)
}
