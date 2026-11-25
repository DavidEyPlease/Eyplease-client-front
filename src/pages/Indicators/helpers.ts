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

/** "2026-11-28" + 6 → "2026-12-04" (en UTC a propósito: es un día de calendario, no un instante) */
export const shiftDay = (date: string, days: number) => {
    const [year, month, day] = date.split('-').map(Number)
    return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10)
}

/** «del 17 al 23 de noviembre» o, si cruza de mes, «del 28 de noviembre al 4 de diciembre» */
export const rangeLabel = (from: string, to: string) => {
    const [, fromMonth, fromDay] = from.split('-').map(Number)
    const [, toMonth, toDay] = to.split('-').map(Number)
    return fromMonth === toMonth
        ? `del ${fromDay} al ${toDay} de ${MONTHS[toMonth - 1] ?? ''}`
        : `del ${fromDay} de ${MONTHS[fromMonth - 1] ?? ''} al ${toDay} de ${MONTHS[toMonth - 1] ?? ''}`
}

/** Cuándo corre un reto a la unidad: el de una semana (o el próximo) dice sus dos fechas; los del mes, hasta cuándo. */
export const scheduleLabel = (challenge: IChallenge) => {
    if (!challenge.is_open) return `terminó el ${dayLabel(challenge.ends_on)}`
    if ((challenge.own_start || challenge.is_upcoming) && challenge.starts_on) return rangeLabel(challenge.starts_on, challenge.ends_on)
    return `hasta el ${dayLabel(challenge.ends_on)}`
}

/** Hoy, fin de mes y fin del mes siguiente como YYYY-MM-DD en el día del teléfono. */
export const monthBounds = () => {
    const now = new Date()
    const pad = (n: number) => String(n).padStart(2, '0')
    const last = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const nextLast = new Date(now.getFullYear(), now.getMonth() + 2, 0)
    const prefix = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`
    return {
        today: `${prefix}-${pad(now.getDate())}`,
        end: `${prefix}-${pad(last)}`,
        nextEnd: `${nextLast.getFullYear()}-${pad(nextLast.getMonth() + 1)}-${pad(nextLast.getDate())}`,
    }
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
    challenge.type === 'unit_hearts' ? 'Corazones Virtuales de Círculo Rosa' : challenge.type === 'unit_reactivation' ? 'estatus diario (Ventas)' : 'Ventas Mensuales Personales'
