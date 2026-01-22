import z, { nullable, object, string } from 'zod'

export const CustomServiceFormSchema = object({
    category: string().nonempty('Selecciona una categoría'),
    title: string('')
        .nonempty('Ingresa un título')
        .max(50, 'El título no puede tener más de 50 caracteres'),
    description: nullable(string().max(500, 'La descripción no puede tener más de 500 caracteres')),
    metadata: object({
        primaryColor: string().nullable(),
        secondaryColor: string().nullable(),
    })
})

export type CustomServiceFormData = z.infer<typeof CustomServiceFormSchema>