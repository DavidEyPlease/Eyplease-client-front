import { Gender } from '@/interfaces/common'
import z, { date, object, string, nullable, optional, enum as enum_ } from 'zod'

export const CustomerSchema = object({
    name: string('El nombre del cliente debe ser válido').nonempty('El nombre del cliente debe ser válido'),
    gender: optional(nullable(enum_(Gender))),
    dob: optional(nullable(date()))
})

export type CustomerFormData = z.infer<typeof CustomerSchema>