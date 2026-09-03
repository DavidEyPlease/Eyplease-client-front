import { BILLING_EXCLUDED_ACCOUNTS } from '@/constants/app'
import useAuthStore from '@/store/auth'

/**
 * Si a esta cuenta se le muestra la facturación.
 *
 * Vive en un hook y no repartido por las vistas para que la regla se lea (y se
 * cambie) en un solo sitio: el sidebar y el perfil preguntan lo mismo.
 */
const useBillingAccess = () => {
    const user = useAuthStore(state => state.user)

    return {
        canSeeBilling: !BILLING_EXCLUDED_ACCOUNTS.includes(user?.account ?? ''),
    }
}

export default useBillingAccess
