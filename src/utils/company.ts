import { APP_ROUTES } from '@/constants/app'
import { IAuthUser } from '@/interfaces/auth'
import { MenuKeys } from '@/interfaces/common'
import useAuthStore from '@/store/auth'

/**
 * La empresa de venta directa de la cuenta y lo que esa empresa permite. Es el ÚNICO lugar donde la web decide qué es de
 * cada empresa: lo manda la API en `/me` (`company`, `company_features`, `company_terms`, desde `Companies` en la API) y
 * aquí sólo se lee. Una pantalla no pregunta «¿es Mary Kay?»: pregunta `can('strategy')` y dice `t('my_group')`.
 *
 * Sin los campos (una API anterior al 19-nov-2026) todo es como siempre: Mary Kay, con todo encendido.
 */
export type Company = 'mary_kay' | 'zermat'

export type CompanyFeature =
    | 'strategy'        // Tu estrategia (órdenes, inventario y catálogo de Mary Kay)
    | 'portal'          // Contraseña de InTouch, robot y reportes del portal
    | 'newsletter'      // Boletín (unidad, área, dinámico y anual)
    | 'indicators'      // Indicadores
    | 'challenges'      // Retos
    | 'library'         // Biblioteca
    | 'trainings'       // Entrenamiento
    | 'events'          // Eventos e invitaciones
    | 'design_requests' // Pedidos de diseño
    | 'assistant'       // El Asistente
    | 'gift_invites'    // Invitar con regalo
    | 'referrals'       // Recomendar a otra Directora
    | 'plan_upgrade'    // Subir de plan
    | 'customers'       // Mis clientas
    | 'directors'       // Mis Directoras y el área
    | 'regenerate'      // Rehacer una pieza y pedirle la foto

export type CompanyTerm = 'group' | 'my_group' | 'member' | 'members' | 'leader'

/** Las palabras de Mary Kay: las de siempre, por si la API todavía no las manda. */
const MARY_KAY_TERMS: Record<CompanyTerm, string> = {
    group: 'unidad',
    my_group: 'Mi unidad',
    member: 'consultora',
    members: 'consultoras',
    leader: 'Directora',
}

type CompanyUser = Pick<IAuthUser, 'company' | 'company_features' | 'company_terms'> | null | undefined

export const companyOf = (user: CompanyUser): Company => user?.company ?? 'mary_kay'

/** ¿Su empresa permite esta función? Sin el mapa de la API, sí (como siempre). */
export const companyCan = (user: CompanyUser, feature: CompanyFeature): boolean =>
    user?.company_features?.[feature] ?? true

/** La palabra de su empresa («grupo» o «unidad», «personas de tu grupo» o «consultoras»…). */
export const companyTerm = (user: CompanyUser, term: CompanyTerm): string =>
    user?.company_terms?.[term] ?? MARY_KAY_TERMS[term]

/** Para los componentes: `const { can, t } = useCompany()`. */
export const useCompany = () => {
    const user = useAuthStore(state => state.user)

    return {
        company: companyOf(user),
        can: (feature: CompanyFeature) => companyCan(user, feature),
        t: (term: CompanyTerm) => companyTerm(user, term),
    }
}

/*
 * Qué función de la empresa pide cada entrada del menú y cada página. Un solo mapa: lo usan el menú (store/auth), el
 * buscador ⌘K y el marco de las páginas (TopShell), así que una página de Mary Kay no se abre ni por liga, ni por un
 * aviso, ni escribiendo la dirección.
 */
export const MENU_FEATURE: Partial<Record<MenuKeys, CompanyFeature>> = {
    [MenuKeys.MY_CLIENTS]: 'customers',
    [MenuKeys.TOOLS]: 'library',
    [MenuKeys.TRAININGS]: 'trainings',
    [MenuKeys.UPLOAD_REPORTS]: 'portal',
    [MenuKeys.SERVICES]: 'design_requests',
    [MenuKeys.EVENTS]: 'events',
    [MenuKeys.CUSTOM_SERVICES]: 'design_requests',
    [MenuKeys.NEWSLETTER]: 'newsletter',
}

const ROUTE_FEATURES: Array<[string, CompanyFeature]> = [
    [APP_ROUTES.INDICATORS, 'indicators'],
    [APP_ROUTES.STRATEGY, 'strategy'],
    [APP_ROUTES.INVENTORY, 'strategy'],
    [APP_ROUTES.HOME.PLAN_STANDARD, 'plan_upgrade'],
    [APP_ROUTES.HOME.PLAN_UPGRADE, 'plan_upgrade'],
    [APP_ROUTES.HOME.NEWSLETTER, 'newsletter'],
    [APP_ROUTES.REPORTS, 'portal'],
    [APP_ROUTES.TOOLS, 'library'],
    [APP_ROUTES.TRAININGS.LIST, 'trainings'],
    [APP_ROUTES.SERVICES, 'design_requests'],
    [APP_ROUTES.CUSTOM_DETAIL, 'design_requests'],
    [APP_ROUTES.NEW_CONSULTING, 'design_requests'],
    [APP_ROUTES.EVENTS, 'events'],
    [APP_ROUTES.CREATE_EVENT, 'events'],
    [APP_ROUTES.EVENT_DETAIL_ONLINE, 'events'],
    [APP_ROUTES.EVENT_DETAIL.replace('/:id', ''), 'events'],
    [APP_ROUTES.HOME.MY_CLIENTS, 'customers'],
    [APP_ROUTES.MY_DIRECTORS, 'directors'],
]

/** La función que pide una ruta (por su inicio: `/newsletter/interactivo` pide la del boletín). */
export const featureForPath = (pathname: string): CompanyFeature | null => {
    const match = ROUTE_FEATURES.find(([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`))
    return match ? match[1] : null
}
