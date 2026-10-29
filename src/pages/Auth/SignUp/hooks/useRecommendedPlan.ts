import { API_ROUTES } from "@/constants/api"
import useFetchQuery from "@/hooks/useFetchQuery"
import { IPlan, PlanKeys } from "@/interfaces/plans"
import { queryKeys } from "@/utils/cache"

const money = (n: number) => `$${n.toLocaleString('es-MX')}`

/**
 * Cómo entra a su plan al registrarse, ya en palabras: con la oferta de entrada (el Standard desde su lanzamiento:
 * «Tus primeros 3 meses a $99», y luego el precio del plan), con su prueba gratis (los días que diga el plan) o
 * pagando sin más. Lo decide la API (`offer` y `trial_days`), no el registro.
 */
export interface PlanDeal {
    kind: 'offer' | 'trial' | 'none'
    /** «Tus primeros 3 meses a $99» · «Pruébalo un mes gratis» */
    title: string | null
    /** «Después, $139 al mes. Lo cancelas cuando quieras.» */
    detail: string | null
    /** Corto, para la columna de «Tu cuenta»: «3 meses a $99» · «1 mes gratis» */
    short: string | null
    /** El botón del paso del plan: «Activar mi mes gratis» sólo si hay prueba */
    cta: string
}

const trialSpan = (days: number) => days === 30 ? 'un mes' : days === 1 ? 'un día' : `${days} días`

export const planDeal = (plan: IPlan | null | undefined): PlanDeal => {
    if (plan?.offer) {
        const { months, amount } = plan.offer
        return {
            kind: 'offer',
            title: `Tus primeros ${months} ${months === 1 ? 'mes' : 'meses'} a ${money(amount)}`,
            detail: `Después, ${money(plan.price ?? 0)} al mes. Lo cancelas cuando quieras.`,
            short: `${months} ${months === 1 ? 'mes' : 'meses'} a ${money(amount)}`,
            cta: 'Me quedo con este plan',
        }
    }
    const days = Number(plan?.trial_days ?? 0)
    if (days > 0) {
        return {
            kind: 'trial',
            title: `Pruébalo ${trialSpan(days)} gratis`,
            detail: 'Sin cobro automático. Cancela cuando quieras.',
            short: days === 30 ? '1 mes gratis' : `${days} ${days === 1 ? 'día' : 'días'} gratis`,
            cta: days === 30 ? 'Activar mi mes gratis' : `Activar mi${days === 1 ? '' : 's'} ${days} ${days === 1 ? 'día' : 'días'} gratis`,
        }
    }
    return { kind: 'none', title: null, detail: null, short: null, cta: 'Me quedo con este plan' }
}

/** El plan que se le recomienda en el registro (misma petición para el paso del plan, «Tu cuenta» y el botón) */
const useRecommendedPlan = (planKey: PlanKeys | null | undefined, enabled = true) => {
    const { response, loading } = useFetchQuery<IPlan>(
        API_ROUTES.SIGN_UP.GET_RECOMMENDED_PLAN.replace('{plan_key}', planKey ?? ''),
        {
            customQueryKey: queryKeys.detail('plan', planKey ?? ''),
            enabled: !!planKey && enabled,
        }
    )
    const plan = response?.data ?? null
    return { plan, loading, deal: planDeal(plan) }
}

export default useRecommendedPlan
