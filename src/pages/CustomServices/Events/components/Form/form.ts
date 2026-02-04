import z, { date, object, optional, string } from 'zod'

export const AddDateSchema = object({
    date: date(),
    time: optional(string().nullable()),
    location: optional(string().nullable()),
})

export const EventFormSchema = object({
    title: string('')
        .nonempty('Ingresa un título'),
    description: string().max(500, 'La descripción no puede exceder los 500 caracteres').nullable(),
    event_type: string().nonempty('Selecciona un tipo de evento'),
    metadata: optional(object({
        primaryColor: optional(string().nullable()),
        secondaryColor: optional(string().nullable()),
    })),
    online_data: optional(object({
        platforms: optional(z.array(string())),
        facebook_group: optional(string().nullable()),
        zoom_id: optional(string().nullable()),
        event_link: optional(string().nullable()),
    })),
    dates: z.array(AddDateSchema).min(1, 'Añade al menos una fecha para el evento'),
}).refine((data) => {
    if (data.event_type === 'online') {
        return data.online_data?.platforms && data.online_data.platforms.length > 0
    }
    return true
}, {
    message: 'Selecciona al menos una plataforma',
    path: ['online_data', 'platforms'],
})

export type EventFormData = z.infer<typeof EventFormSchema>
export type DateFormData = z.infer<typeof AddDateSchema>

export const ONLINE_PLATFORMS = [
    { label: 'Facebook', value: 'facebook' },
    { label: 'Zoom', value: 'zoom' },
    { label: 'Otro medio', value: 'other' },
]

export const DEFAULT_VALUES: EventFormData = {
    title: '',
    description: null,
    event_type: '',
    dates: [],
    online_data: undefined
}