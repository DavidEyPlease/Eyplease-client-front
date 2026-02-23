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