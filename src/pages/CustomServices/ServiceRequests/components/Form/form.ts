import z, { nullable, object, string } from 'zod'

export const CustomServiceFormSchema = object({
    category: string().nonempty('Selecciona una categoría'),
    title: string('')
        .nonempty('Ingresa un título'),
    description: nullable(string()),
    metadata: object({
        primaryColor: string().nullable(),
        secondaryColor: string().nullable(),
    })
})

export type CustomServiceFormData = z.infer<typeof CustomServiceFormSchema>