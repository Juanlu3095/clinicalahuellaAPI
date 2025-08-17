import z from 'zod'

const Category = z.object({
  nombre: z.string({ required_error: 'El campo nombre es requerido.', invalid_type_error: 'El campo nombre debe ser un string.' }).min(1, { message: 'El campo nombre está vacío.' })
})

// Podríamos desestructurar para decirle a la función qué campos vamos a validar exactamente: const Validate = ({ username = "Pepe", ... }) => ...

export const validateCategory = (category) => {
  return Category.required().safeParse(category)
}
