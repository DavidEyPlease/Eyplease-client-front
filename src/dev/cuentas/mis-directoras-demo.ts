/**
 * «Mis Directoras» del simulador (plan Nacional): la forma y las cifras de un Área real del 29-oct-2026 (17 Directoras,
 * 4 en Eyplease+) con la gente inventada y sin fotos ni teléfonos reales.
 */
const hace = (dias: number) => new Date(Date.now() - dias * 86_400_000).toISOString()

const pendiente = (key: string, label: string, count: number, never = false) => ({ key, label, count, today: 0, never })

const conApp = (id: string, name: string, plan: string, reached: number, count: number, sent: number | null, pending: ReturnType<typeof pendiente>[], unit: number) => ({
    id,
    name,
    photo: null,
    has_photo: id !== 'd-1',
    phone: null,
    unit_size: unit,
    invited_at: null,
    last_invited_at: null,
    app: {
        plan,
        last_seen_at: hace(0),
        last_sent_at: sent === null ? null : hace(sent),
        coverage: { people_count: count, people_reached: reached, percent: Math.round(100 * reached / count) },
        pending_total: pending.reduce((total, item) => total + item.count, 0),
        pending,
    },
})

const SIN_APP: Array<[string, number]> = [
    ['Leticia Ibarra Montes', 79], ['Irene Solís Quintero', 75], ['Guadalupe Rivas Lemus', 75], ['Jaqueline Peña Fuentes', 42],
    ['Norma García Escobedo', 40], ['Carmina Ortiz Bustos', 38], ['Griselda Herrera Palacios', 36], ['María Isabel Roldán Hinojosa', 35],
    ['Eloísa Andrade Juárez', 31], ['Ma. Guadalupe Becerril Cortés', 27], ['Ma. Concepción Cano Pineda', 27], ['Ana Beatriz Pineda Morales', 24],
    ['Ma. del Socorro Lara Peñaloza', 23],
]

/** A quién ya invitó en el simulador (empieza con una, para ver la marca) */
const invitadas = new Map<string, string>([['s-2', hace(2)]])

export const invitarEnDemo = (id: string) => {
    invitadas.set(id, invitadas.get(id) ?? new Date().toISOString())
    return { invited_at: invitadas.get(id), last_invited_at: new Date().toISOString(), invite_link: 'https://eyplease.com.mx/invitacion/?invita=DK7M2QX' }
}

export const misDirectorasDemo = () => ({
    month: new Date().toISOString().slice(0, 7),
    area_month: '2026-09',
    title: 'Directora Nacional',
    invite_link: 'https://eyplease.com.mx/invitacion/?invita=DK7M2QX',
    summary: { directors: 17, with_app: 4, people_count: 67, people_reached: 29, percent: 43, without_app: 13, without_app_people: 552, invited: invitadas.size, without_photo: 9 },
    directors: [
        conApp('d-1', 'Lucía Velarde Serrano', 'Plan Básico', 2, 21, 13, [pendiente('pink_circle', 'Círculo rosa', 15, true), pendiente('birthdays', 'Cumpleaños', 6), pendiente('road_to_success', 'Camino al éxito', 6, true), pendiente('honor_roll', 'Cuadro de honor', 4, true), pendiente('stars', 'Estrellas', 1)], 56),
        conApp('d-2', 'Rosa María Saldaña García', 'Plan Básico', 6, 13, 20, [pendiente('pink_circle', 'Círculo rosa', 7), pendiente('honor_roll', 'Cuadro de honor', 3), pendiente('stars', 'Estrellas', 2), pendiente('birthdays', 'Cumpleaños', 2), pendiente('road_to_success', 'Camino al éxito', 1, true)], 28),
        conApp('d-3', 'Ma. de la Luz Becerril Contreras', 'Plan Ejecutivo', 11, 22, 0, [pendiente('pink_circle', 'Círculo rosa', 7), pendiente('honor_roll', 'Cuadro de honor', 4), pendiente('stars', 'Estrellas', 4), pendiente('birthdays', 'Cumpleaños', 4), pendiente('road_to_success', 'Camino al éxito', 4, true), pendiente('new_beginnings', 'Nuevos inicios', 1)], 55),
        conApp('d-4', 'Ofelia Robles López', 'Plan Básico', 10, 11, 3, [pendiente('birthdays', 'Cumpleaños', 1)], 24),
        ...SIN_APP.map(([name, unit], index) => ({ id: `s-${index}`, name, photo: null, has_photo: index % 2 === 0, phone: null, unit_size: unit, app: null, invited_at: invitadas.get(`s-${index}`) ?? null, last_invited_at: invitadas.get(`s-${index}`) ?? null })),
    ],
})
