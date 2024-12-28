import z from 'zod'

const Newsletter = z.object({
  email: z.string({ invalid_type_error: 'email debe ser un string.' }).email()
})

export const validateNewsletter = (newsletter) => {
  return Newsletter.safeParse(newsletter)
}
