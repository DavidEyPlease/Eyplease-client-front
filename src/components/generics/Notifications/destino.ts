import { INotification } from "@/interfaces/notification"
import { APP_ROUTES } from "@/constants/app"

/** Para que la campana abra el Asistente acoplado (lo escucha `TopShell`) */
export const ABRIR_ASISTENTE = 'eyplease:abrir-asistente'

export type Destino = { ruta: string } | { externa: string } | { asistente: true }

/** Las ligas internas de los avisos del equipo (`app://retos`…, el catálogo de la app) en la web */
const APP_LINK_EN_LA_WEB: Record<string, string> = {
    hoy: APP_ROUTES.HOME.INITIAL, inicio: APP_ROUTES.HOME.INITIAL,
    retos: APP_ROUTES.INDICATORS, indicadores: APP_ROUTES.INDICATORS,
    boletin: APP_ROUTES.HOME.NEWSLETTER, 'boletin-interactivo': APP_ROUTES.HOME.NEWSLETTER_INTERACTIVE,
    'mis-clientas': APP_ROUTES.HOME.MY_CLIENTS, clientas: APP_ROUTES.HOME.MY_CLIENTS,
    'mi-unidad': APP_ROUTES.MY_UNIT, unidad: APP_ROUTES.MY_UNIT, 'mis-directoras': APP_ROUTES.MY_DIRECTORS,
    novedades: APP_ROUTES.POSTS.LIST, biblioteca: APP_ROUTES.POSTS.LIST, guardados: APP_ROUTES.SERVICES,
    herramientas: APP_ROUTES.TOOLS, entrenamiento: APP_ROUTES.TRAININGS.LIST, entrenamientos: APP_ROUTES.TRAININGS.LIST,
    estrategia: APP_ROUTES.STRATEGY, inventario: APP_ROUTES.INVENTORY, perfil: APP_ROUTES.HOME.PROFILE,
    ayuda: APP_ROUTES.HELP_CENTER,
}

const sinAcentos = (texto: string) => texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase()

/** La liga de un aviso del equipo: una página web se abre aparte; una `app://` va a su sección de la web */
const destinoDeLiga = (link: unknown): Destino | null => {
    if (typeof link !== 'string' || !link.trim()) return null
    if (/^https?:\/\//i.test(link.trim())) return { externa: link.trim() }
    const liga = sinAcentos(link)
    if (!liga.startsWith('app://')) return null
    const [seccion, id] = liga.slice('app://'.length).split(/[?#]/)[0].split('/').filter(Boolean)
    if (seccion === 'asistente') return { asistente: true }
    if ((seccion === 'entrenamiento' || seccion === 'entrenamientos') && id) return { ruta: APP_ROUTES.TRAININGS.WEB.replace(':id', encodeURIComponent(id)) }
    const ruta = seccion ? APP_LINK_EN_LA_WEB[seccion] : undefined
    return ruta ? { ruta } : null
}

/**
 * Los avisos traen la ruta de la APP (`navigateTo` + `navigateParam`); aquí se traduce a la de
 * la web. Los avisos del equipo traen una liga (`link`) y los más viejos `page`. Lo que la web no
 * tiene se queda sin destino (el clic sólo cierra el menú).
 */
export const destinoEnLaWeb = (data: INotification['data']): Destino | null => {
    const param = data?.navigateParam ? String(data.navigateParam) : ''
    const ruta = (r: string): Destino => ({ ruta: r })
    switch (data?.navigateTo ?? data?.page) {
        /* La presentación regresa sola al listado si el tema no tiene una */
        case '/training-detail': return ruta(param ? APP_ROUTES.TRAININGS.WEB.replace(':id', encodeURIComponent(param)) : APP_ROUTES.TRAININGS.LIST)
        case '/training': return ruta(APP_ROUTES.TRAININGS.LIST)
        case '/news': return ruta(APP_ROUTES.POSTS.LIST)
        case '/tools': return ruta(APP_ROUTES.TOOLS)
        /* Los pedidos de diseño: en la app viven en Guardados; en la web, en Servicios */
        case '/services':
        case '/service-detail':
        case '/saved': return ruta(APP_ROUTES.SERVICES)
        case '/newsletter': return ruta(APP_ROUTES.HOME.NEWSLETTER)
        /* Pagos y facturas de la app = Perfil → Facturación en la web */
        case '/payments-and-bills': return ruta(`${APP_ROUTES.HOME.PROFILE}?section=billing`)
        case '/my-unit': return ruta(APP_ROUTES.MY_UNIT)
        case '/my-directors': return ruta(APP_ROUTES.MY_DIRECTORS)
        case '/estrategia': return ruta(APP_ROUTES.STRATEGY)
        case '/inventario': return ruta(APP_ROUTES.INVENTORY)
        case '/indicators': return ruta(APP_ROUTES.INDICATORS)
        case '/hoy': return ruta(APP_ROUTES.HOME.INITIAL)
        case '/assistant': return { asistente: true }
        default: return destinoDeLiga(data?.link)
    }
}
