import { Format, format } from "@formkit/tempo"

export const formatDate = (date: Date | string, options?: { formatter?: Format, locale?: string }) => {
    const defaultFormat: Format = { date: "medium", time: "short" }
    return format({
        date,
        format: options?.formatter || defaultFormat,
        locale: options?.locale,
        // tz: 'America/Mexico_City'
    })
}