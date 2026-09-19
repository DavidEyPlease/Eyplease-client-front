import { IChallenge } from '@/interfaces/challenges'

const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

/** "2026-09" → "septiembre" */
export const monthName = (yearMonth?: string | null) => {
    const month = Number((yearMonth ?? '').split('-')[1])
    return MONTHS[month - 1] ?? ''
}

/** "2026-09-30" → "30 de septiembre" (sin pasar por Date: es un día de calendario, no un instante) */
export const dayLabel = (date: string) => {
    const [, month, day] = date.split('-').map(Number)
    return `${day} de ${MONTHS[month - 1] ?? ''}`
}

/** Hoy y fin de mes como YYYY-MM-DD en el día del teléfono. */
export const monthBounds = () => {
    const now = new Date()
    const pad = (n: number) => String(n).padStart(2, '0')
    const last = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const prefix = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`
    return { today: `${prefix}-${pad(now.getDate())}`, end: `${prefix}-${pad(last)}` }
}

export const formatNumber = (value: number) => value.toLocaleString('es-MX')

/** Avance de 0 a 100 para la barra. */
export const progressPercent = ({ progress }: IChallenge) => {
    if (progress.measure === 'percent') return Math.min(100, Math.round(100 * progress.current / Math.max(1, progress.goal)))
    return progress.goal ? Math.min(100, Math.round(100 * progress.current / progress.goal)) : 0
}

/** El avance en corto, para la pastilla de la tarjeta. */
export const progressChip = ({ progress }: IChallenge) => {
    if (progress.measure === 'percent') return `${progress.current}% de ${progress.goal}%`
    return `${progress.current} de ${progress.goal}`
}

/** En qué se mide cada persona dentro de un reto. */
export const rowUnit = (challenge: IChallenge) => {
    if (challenge.type === 'unit_points') return 'pts'
    if (challenge.type === 'unit_hearts') return challenge.target === 1 ? 'corazón' : 'corazones'
    return 'pidieron'
}

/** De dónde sale el avance, para decirlo cuando el reporte no se ha cargado. */
export const sourceName = (challenge: IChallenge) =>
    challenge.type === 'unit_hearts' ? 'Corazones Virtuales de Círculo Rosa' : 'Ventas Mensuales Personales'
