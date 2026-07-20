import { Format, format } from "@formkit/tempo"

export const formatDate = (date: Date | string, options?: { formatter?: Format, locale?: string, dateOnly?: boolean }) => {
    const defaultFormat: Format = { date: "medium", time: "short" }
    // Cuando solo interesa la fecha (sin hora), se usa tz: 'UTC' para evitar
    // que la conversión de zona horaria cambie el día (e.g. 2026-02-21T00:00:00Z → 20 feb en CDMX)
    const tz = options?.dateOnly ? 'UTC' : 'America/Mexico_City'
    return format({
        date,
        format: options?.formatter || defaultFormat,
        locale: options?.locale,
        tz, // TODO: Esto debería ser dinámico dependiendo de la zona horaria del usuario, pero por ahora se fija a CDMX
    })
}

export const singleFormatDate = (date: Date, formatStyle: Format = { date: "medium", time: "short" }) => {
    return format(date, formatStyle)
}

/**
 * Etiqueta del mes de reporte (siempre el mes anterior): "Junio 2026".
 * Los reportes de un mes se cargan al mes siguiente (en julio se suben los de junio).
 * Se fija el día a 1 antes de restar para evitar el overflow de meses cortos.
 */
export const reportMonthLabel = (): string => {
    const date = new Date()
    date.setDate(1)
    date.setMonth(date.getMonth() - 1)
    const month = date.toLocaleDateString('es-MX', { month: 'long' })
    return `${month.charAt(0).toUpperCase()}${month.slice(1)} ${date.getFullYear()}`
}