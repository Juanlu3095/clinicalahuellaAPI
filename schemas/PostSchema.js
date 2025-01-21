import z from 'zod'

const Post = z.object({
  slug: z.string({ required_error: 'El campo slug es requerido.', invalid_type_error: 'El campo slug debe ser un string.' }),
  titulo: z.string({ required_error: 'El campo titulo es requerido.', invalid_type_error: 'El campo titulo debe ser un string.' }),
  contenido: z.string({ required_error: 'El campo contenido es requerido.', invalid_type_error: 'El campo contenido debe ser un texto.' }),
  categoria: z.number({ required_error: 'El campo categoria es requerido.', invalid_type_error: 'El campo categoria debe ser un número.' }).int({ message: 'El campo categoria debe ser un entero.' }),
  imagen: z.number({ required_error: 'El campo imagen es requerido.', invalid_type_error: 'El campo imagen debe ser un número.' }).int({ message: 'El campo imagen debe ser un entero.' })
})

// Podríamos desestructurar para decirle a la función qué campos vamos a validar exactamente: const Validate = ({ username = "Pepe", ... }) => ...

export const validatePost = (post) => {
  return Post.required({ // Indicamos los campos obligatorios
    slug: true,
    titulo: true,
    contenido: true
  })
    .safeParse(post)
}

export const validatePartialPost = (post) => {
  return Post.partial().safeParse(post)
}
