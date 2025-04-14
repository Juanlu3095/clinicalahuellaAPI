import z from 'zod'

const Category = z.object({
  nombre: z.string({ required_error: 'El campo nombre es requerido.', invalid_type_error: 'El campo nombre debe ser un string.' })
})

// Podríamos desestructurar para decirle a la función qué campos vamos a validar exactamente: const Validate = ({ username = "Pepe", ... }) => ...

export const validateCategory = (category) => {
  return Category.required({ // Indicamos los campos obligatorios
    nombre: true
  })
    .safeParse(category)
}

export const validatePartialCategory = (post) => {
  return Category.partial().safeParse(post)
}
