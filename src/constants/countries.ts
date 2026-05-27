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

export const STORE_URLS = {
    ios: 'https://apps.apple.com/mx/app/eyplease/id6756317945',
    android: 'https://play.google.com/store/apps/details?id=com.eyplease&pcampaignid=web_share',
}
