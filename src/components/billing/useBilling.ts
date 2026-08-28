import { API_ROUTES } from '@/constants/api'
import useFetchQuery from '@/hooks/useFetchQuery'
import { IBillingOverview } from '@/interfaces/billing'
import { billingOverviewKey } from './utils'

const OVERVIEW_STALE_TIME_MS = 300_000

/**
 * Resumen de facturación del usuario en sesión.
 *
 * Comparte queryKey con el resto de la app, así que la tarjeta del sidebar y la
 * ficha del perfil se sirven de la misma petición y se refrescan a la vez cuando
 * se sube un comprobante.
 */
const useBilling = () => {
    const { response, loading } = useFetchQuery<IBillingOverview>(API_ROUTES.BILLING.OVERVIEW, {
        customQueryKey: billingOverviewKey,
        staleTime: OVERVIEW_STALE_TIME_MS,
    })

    return {
        overview: response?.data,
        loading,
    }
}

export default useBilling
