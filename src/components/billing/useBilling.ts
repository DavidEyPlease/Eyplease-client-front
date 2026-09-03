import { API_ROUTES } from '@/constants/api'
import useFetchQuery from '@/hooks/useFetchQuery'
import { IBillingOverview } from '@/interfaces/billing'
import useAuthStore from '@/store/auth'
import useBillingAccess from './useBillingAccess'
import { billingOverviewKey } from './utils'

const OVERVIEW_STALE_TIME_MS = 300_000

/**
 * Resumen de facturación del usuario en sesión.
 *
 * Comparte queryKey con el resto de la app, así que la tarjeta del sidebar y la
 * ficha del perfil se sirven de la misma petición y se refrescan a la vez cuando
 * se sube un comprobante.
 *
 * A las cuentas excluidas ni se les pide: el corte va aquí y no en cada vista,
 * porque devolver null en el componente no evita la llamada.
 */
const useBilling = () => {
    const { canSeeBilling } = useBillingAccess()
    const hasUser = useAuthStore(state => !!state.user)

    const { response, loading } = useFetchQuery<IBillingOverview>(API_ROUTES.BILLING.OVERVIEW, {
        customQueryKey: billingOverviewKey,
        staleTime: OVERVIEW_STALE_TIME_MS,
        /* Solo con sesión resuelta: el overview es la segunda puerta del arranque, no la primera */
        enabled: canSeeBilling && hasUser,
        // La escalada cambia con el día: si vuelve a la pestaña, se vuelve a preguntar
        refetchOnWindowFocus: true,
    })

    return {
        overview: response?.data,
        loading,
        canSeeBilling,
    }
}

export default useBilling
