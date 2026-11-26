import { Gender } from '@/interfaces/common'
import z, { object, string, nullable, optional, enum as enum_ } from 'zod'

export const SponsoredSchema = object({
    name: string('El nombre del vendedor (a) debe ser válido').trim().nonempty('El nombre del vendedor (a) debe ser válido'),
    /* El apodo de la Directora (la API acepta hasta 40 letras); vacío lo quita */
    nickname: optional(nullable(string().trim().max(40, 'El apodo puede tener hasta 40 letras'))),
    gender: optional(nullable(enum_(Gender)))
})

export type SponsoredFormData = z.infer<typeof SponsoredSchema>