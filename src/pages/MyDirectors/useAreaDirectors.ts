import { API_ROUTES } from '@/constants/api'
import useFetchQuery from '@/hooks/useFetchQuery'
import type { IUser } from '@/interfaces/users'
import useAuthStore from '@/store/auth'

export interface AreaDirectorPending {
    key: string
    label: string
    count: number
    /** Piezas de esa sección que celebran algo de hoy */
    today: number
    /** Nunca ha enviado nada de esa sección (toda su historia) */
    never: boolean
}

export interface AreaDirectorApp {
    plan: string | null
    last_seen_at: string | null
    last_sent_at: string | null
    coverage: { people_count: number, people_reached: number, percent: number }
    pending_total: number
    pending: AreaDirectorPending[]
}

export interface AreaDirector {
    id: string
    name: string
    photo: string | null
    /** Sólo dígitos, con lada de país; null si no hay uno que sirva para WhatsApp */
    phone: string | null
    unit_size: number | null
    /** null = todavía no usa Eyplease+ */
    app: AreaDirectorApp | null
}

export interface AreaDirectors {
    month: string
    /** De qué Reconocimiento del Área sale la lista (AAAA-MM); null si nunca ha cargado uno */
    area_month: string | null
    invite_link: string | null
    summary: {
        directors: number
        with_app: number
        people_count: number
        people_reached: number
        percent: number
        without_app: number
        without_app_people: number
    }
    /** Primero las que usan Eyplease+ (de la que más le falta a la que menos), luego las demás por tamaño de unidad */
    directors: AreaDirector[]
}

/** «Mis Directoras» viene en el plan Nacional (David, 29-oct-2026). La API pide lo mismo. */
export const planConMisDirectoras = (user?: IUser | null): boolean => user?.plan?.plan_key === 'national'

/** Las Directoras del Área de la Nacional y cómo va el seguimiento de cada una. Comparten caché la tarjeta y la página. */
const useAreaDirectors = () => {
    const user = useAuthStore(state => state.user)
    const enabled = planConMisDirectoras(user)

    const { response, loading, error } = useFetchQuery<AreaDirectors>(API_ROUTES.AREA.DIRECTORS, {
        customQueryKey: ['area', 'directors'],
        enabled,
        staleTime: 60_000,
        refetchOnWindowFocus: true,
    })

    /* Si la consulta falla no hay nada que decir: mejor no pintar que pedirle un reporte que sí cargó */
    return { enabled, loading: enabled && loading, error: enabled && !!error, data: response?.data }
}

export default useAreaDirectors
