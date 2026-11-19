export interface Country {
    code: string
    name: string
    dial: string
    flag: string
}

export const COUNTRIES: Country[] = [
    { code: 'MX', name: 'México', dial: '+52', flag: '🇲🇽' },
    { code: 'CO', name: 'Colombia', dial: '+57', flag: '🇨🇴' },
    { code: 'US', name: 'Estados Unidos', dial: '+1', flag: '🇺🇸' },
    { code: 'AR', name: 'Argentina', dial: '+54', flag: '🇦🇷' },
    { code: 'CL', name: 'Chile', dial: '+56', flag: '🇨🇱' },
    { code: 'PE', name: 'Perú', dial: '+51', flag: '🇵🇪' },
    { code: 'EC', name: 'Ecuador', dial: '+593', flag: '🇪🇨' },
    { code: 'GT', name: 'Guatemala', dial: '+502', flag: '🇬🇹' },
    { code: 'CR', name: 'Costa Rica', dial: '+506', flag: '🇨🇷' },
    { code: 'PA', name: 'Panamá', dial: '+507', flag: '🇵🇦' },
    { code: 'DO', name: 'República Dominicana', dial: '+1', flag: '🇩🇴' },
    { code: 'ES', name: 'España', dial: '+34', flag: '🇪🇸' },
]

export const DEFAULT_COUNTRY_CODE = 'MX'

/**
 * `?pais=co` en la liga (los anuncios y el bot de Colombia): el registro arranca con ese país, para que la cuenta no nazca
 * como de México sólo porque no cambió la lada (David, 19-nov-2026: «tenemos que prepararnos para movernos allá»).
 */
export const countryFromLink = (): string | null => {
    const code = new URLSearchParams(window.location.search).get('pais')?.trim().toUpperCase()
    return code && COUNTRIES.some(country => country.code === code) ? code : null
}

/** El portal de Mary Kay de cada país, como lo conoce la Directora. */
const MK_PORTALS: Record<string, string> = { MX: 'marykayintouch.com.mx', CO: 'marykayintouch.com.co' }
export const mkPortalFor = (code?: string | null) => MK_PORTALS[code ?? ''] ?? MK_PORTALS[DEFAULT_COUNTRY_CODE]

/** Dinero con la costumbre de su moneda: «$64.900» en pesos colombianos, «$349» en mexicanos. */
export const moneyFor = (amount: number, currency: string = 'MXN') =>
    `$${amount.toLocaleString(currency === 'COP' ? 'es-CO' : 'es-MX')}`

export const STORE_URLS = {
    ios: 'https://apps.apple.com/mx/app/eyplease/id6756317945',
    android: 'https://play.google.com/store/apps/details?id=com.eyplease&pcampaignid=web_share',
}
