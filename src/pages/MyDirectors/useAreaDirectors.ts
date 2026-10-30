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
    /** Si tiene la foto con que sale en sus piezas (la de Galería → Directoras) */
    has_photo: boolean
    /** Sólo dígitos, con lada de país; null si no hay uno que sirva para WhatsApp */
    phone: string | null
    unit_size: number | null
    /** null = todavía no usa Eyplease+ */
    app: AreaDirectorApp | null
    /** Cuándo la invitó (y la última vez que le volvió a mandar la invitación); null si no la ha invitado */
    invited_at: string | null
    last_invited_at: string | null
}

export interface AreaDirectors {
    month: string
    /** De qué mes son sus reportes del Área, de donde sale la lista (AAAA-MM); null si no ha cargado ninguno */
    area_month: string | null
    /** Cómo se le dice a ella: «Directora Nacional», «Directora Élite»… */
    title: string
    /** Su página de invitación con su código: en WhatsApp se ve con la imagen de la invitación */
    invite_link: string | null
    summary: {
        directors: number
        with_app: number
        people_count: number
        people_reached: number
        percent: number
        without_app: number
        without_app_people: number
        /** De las que no están, a cuántas ya invitó */
        invited: number
        /** Cuántas no tienen la foto con que salen en sus piezas */
        without_photo: number
    }
    /** Primero las que usan Eyplease+ (de la que más le falta a la que menos), luego las demás por tamaño de unidad */
    directors: AreaDirector[]
}

/** «Mis Directoras» viene en el plan Área (clave `national`; antes «Plan Nacional»). La API pide lo mismo. */
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
