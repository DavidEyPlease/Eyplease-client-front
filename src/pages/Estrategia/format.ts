/** Pesos enteros, como los precios de catálogo ($404, $23,704). */
export const money = (value: number) => `${value < 0 ? '−' : ''}$${Math.round(Math.abs(value)).toLocaleString('es-MX')}`

/** Piezas: casi siempre enteras; si no, con un decimal. */
export const pieces = (value: number) => Number.isInteger(value) ? String(value) : value.toFixed(1)

/** «2026-10-14» → «14 de octubre». Se arma a mano para que México no la atrase un día al pasar por UTC. */
export const dayLabel = (date: string | null | undefined, withYear = false) => {
    if (!date) return ''
    const [year, month, day] = date.slice(0, 10).split('-').map(Number)
    if (!year || !month || !day) return ''
    const sameYear = year === new Date().getFullYear()
    return new Date(year, month - 1, day).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', ...(withYear || !sameYear ? { year: 'numeric' } : {}) })
}

/** Cuánto lleva guardado, en palabras: «hace 6 semanas». */
export const storedLabel = (days: number) => {
    if (days <= 0) return 'de hoy'
    if (days === 1) return 'desde ayer'
    if (days < 14) return `hace ${days} días`
    if (days < 60) return `hace ${Math.round(days / 7)} semanas`
    return `hace ${Math.round(days / 30)} meses`
}

/** Fecha de una venta (llega con hora, en UTC): «hoy», «ayer» o «14 de octubre» («14 oct» con `short`). */
export const saleDayLabel = (iso: string | null, short = false) => {
    if (!iso) return ''
    const date = new Date(iso)
    const today = new Date()
    const start = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
    const diff = Math.round((start(today) - start(date)) / 86400000)
    if (diff === 0) return 'hoy'
    if (diff === 1) return 'ayer'
    if (short) return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }).replace('.', '')
    return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', ...(date.getFullYear() !== today.getFullYear() ? { year: 'numeric' } : {}) })
}

/** Lo que gana en una línea de venta; nulo si todavía no sabemos cuánto le costó. */
export const lineProfit = (unitPrice: number, unitCost: number | null, quantity: number) =>
    unitCost === null ? null : Math.round((unitPrice - unitCost) * quantity * 100) / 100

/** El mensaje de la API si se le puede enseñar a ella; los técnicos («No query results…») se cambian por el de repuesto. */
export const friendlyError = (error: unknown, fallback: string) => {
    const message = (error as { message?: unknown } | null)?.message
    if (typeof message !== 'string' || !message.trim()) return fallback
    return /No query results|SQLSTATE|File: |Error interno|Unauthorized|REQUEST_TIMEOUT|Failed to fetch/i.test(message) ? fallback : message
}

/** Reparte un precio de paquete entre sus productos según su precio normal (el último se queda con el redondeo). */
export const splitPrice = (total: number, normals: number[]) => {
    const sum = normals.reduce((acc, value) => acc + value, 0)
    if (!sum) return normals.map(() => 0)
    const parts = normals.map(value => Math.round((total * value) / sum))
    parts[parts.length - 1] += Math.round(total) - parts.reduce((acc, value) => acc + value, 0)
    return parts
}

/** «$1,234.50» → 1234.5; vacío o sin número → null. */
export const parseAmount = (text: string): number | null => {
    const clean = text.replace(/[^\d.]/g, '')
    if (!clean) return null
    const value = Number(clean)
    return Number.isFinite(value) ? value : null
}
