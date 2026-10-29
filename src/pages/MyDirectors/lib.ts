import { ESCALONES } from '@/pages/Dashboard/components/useUnitFollowUp'
import type { AreaDirector } from './useAreaDirectors'

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

/** El escalón que ya alcanzó (o null si todavía no llega a Constante). */
export const escalonAlcanzado = (percent: number) => [...ESCALONES].reverse().find(escalon => percent >= escalon.pct) ?? null

/** «2026-09» → «septiembre» */
export const nombreDelMes = (yearMonth?: string | null) => (yearMonth ? MESES[Number(yearMonth.slice(5, 7)) - 1] ?? '' : '')

const diasDesde = (iso: string) => {
    const a = new Date(iso)
    const hoy = new Date()
    a.setHours(0, 0, 0, 0)
    hoy.setHours(0, 0, 0, 0)
    return Math.round((hoy.getTime() - a.getTime()) / 86_400_000)
}

/** «hoy», «ayer», «hace 3 días» o «el 9 de octubre». */
export const haceCuanto = (iso: string) => {
    const dias = diasDesde(iso)
    if (dias <= 0) return 'hoy'
    if (dias === 1) return 'ayer'
    if (dias < 7) return `hace ${dias} días`
    const fecha = new Date(iso)
    return `el ${fecha.getDate()} de ${MESES[fecha.getMonth()]}`
}

/**
 * A partir de cuántos días sin enviar nada se nota en su tarjeta. Una semana: el aviso diario de seguimiento ya le
 * recuerda a ella; aquí es para que su Nacional sepa a quién llamar.
 */
const DIAS_SIN_ENVIAR = 7

export const sinEnviarHaceMucho = (director: AreaDirector) =>
    !!director.app && (!director.app.last_sent_at || diasDesde(director.app.last_sent_at) >= DIAS_SIN_ENVIAR)

export const iniciales = (name: string) => name.trim().split(/\s+/).filter(word => word.length > 2 || /^[A-ZÁÉÍÓÚÑ]/.test(word)).slice(0, 2).map(word => word[0]?.toUpperCase() ?? '').join('')

const pila = (name: string) => {
    const palabras = name.trim().split(/\s+/)
    /* «Ma. de la Luz Becerra» se queda en «Ma. de la Luz»: «Ma.» sola no es un nombre */
    if (/^ma\.?$/i.test(palabras[0] ?? '')) {
        const resto = palabras.slice(1)
        const fin = resto.findIndex(palabra => !/^(de|del|la|las|los)$/i.test(palabra))
        return ['Ma.', ...resto.slice(0, fin + 1)].join(' ')
    }
    return palabras[0] ?? ''
}

/** WhatsApp con el mensaje ya escrito; sin teléfono, WhatsApp le deja escoger a quién. */
export const ligaWhatsApp = (phone: string | null, text: string) =>
    `https://wa.me/${phone ?? ''}?text=${encodeURIComponent(text)}`

/**
 * Lo que la Nacional le escribe a una Directora que usa Eyplease+. Dice de dónde lo sabe (su seguimiento en Eyplease+):
 * la Directora ya fue avisada de que su Nacional lo ve, y así no suena a vigilancia.
 */
export const mensajeParaDirectora = (director: AreaDirector) => {
    const app = director.app
    const nombre = pila(director.name)
    if (!app) return ''
    const { people_reached: llego, people_count: total, percent } = app.coverage

    if (percent >= 75) {
        return `¡Felicidades, ${nombre}! Vi tu seguimiento en Eyplease+: este mes ya le llegaste a ${llego} de tus ${total} consultoras (${percent} %). Así se acompaña a una unidad. ¡Gracias por cuidarlas así!`
    }

    const principal = app.pending[0]
    const falta = app.pending_total > 0
        ? ` Tienes ${app.pending_total} ${app.pending_total === 1 ? 'pieza lista' : 'piezas listas'} para enviar${principal ? `, sobre todo de ${principal.label}` : ''}.`
        : ''

    return `¡Hola, ${nombre}! Vi cómo va tu seguimiento en Eyplease+: este mes le has llegado a ${llego} de tus ${total} consultoras.${falta} ¿Te ayudo a que les llegue a todas esta semana?`
}

/**
 * La invitación a una Directora que todavía no usa Eyplease+, con la liga de la página de invitación: WhatsApp la enseña
 * con la imagen «Te invita tu Directora…». Con esa liga entra con su primer mes del Plan Ejecutivo de regalo.
 */
export const mensajeDeInvitacion = (director: AreaDirector, link: string | null) => {
    const nombre = pila(director.name)
    return `¡Hola, ${nombre}! Te invito a Eyplease+. Yo lo uso para reconocer a mi Área: prepara solas las piezas de cumpleaños, Cuadro de Honor, Estrellas y Círculo Rosa con la foto y el nombre de cada consultora, listas para enviar. Con mi invitación tu primer mes del Plan Ejecutivo es de regalo.${link ? ` Aquí lo ves: ${link}` : ''}`
}
