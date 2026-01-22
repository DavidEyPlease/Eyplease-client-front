import { Gender } from '@/interfaces/common'
import z, { object, string, nullable, optional, enum as enum_ } from 'zod'

export const SponsoredSchema = object({
    name: string('El nombre del vendedor (a) debe ser válido').nonempty('El nombre del vendedor (a) debe ser válido'),
    gender: optional(nullable(enum_(Gender)))
})

export type SponsoredFormData = z.infer<typeof SponsoredSchema>