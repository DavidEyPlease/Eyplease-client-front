import { useRef } from "react"

import { API_ROUTES } from "@/constants/api"
import useFetchQuery from "@/hooks/useFetchQuery"
import { IPlan, IPlanOfferCommitment, PlanKeys } from "@/interfaces/plans"
import { queryKeys } from "@/utils/cache"

const money = (n: number) => `$${n.toLocaleString('es-MX')}`

/**
 * Cómo entra a su plan al registrarse, ya en palabras: con la oferta de entrada («Tus primeros 6 meses a $659» en el
 * Buen Fin), con su prueba gratis (los días que diga el plan) o pagando sin más. Lo decide la API (`offer` y
 * `trial_days`), no el registro. El Standard, desde el 9-nov-2026, entra con su mes gratis y dice lo que paga si se
 * queda (`after_trial_offer`: «tus primeros 6 meses a $99»).
 * Si la oferta trae permanencia (`offer.commitment`: Elite y Área en el Buen Fin) ya no se cancela «cuando quieras»: lo
 * dice, y el último paso le pide aceptar sus términos.
 */
export interface PlanDeal {
    kind: 'offer' | 'trial' | 'none'
    /** «Tus primeros 3 meses a $99» · «Pruébalo un mes gratis» */
    title: string | null
    /** «Después, $139 al mes. Lo cancelas cuando quieras.» (con permanencia, lo que pasa si cancela antes) */
    detail: string | null
    /** Corto, para la columna de «Tu cuenta»: «3 meses a $99» · «1 mes gratis» */
    short: string | null
    /** El botón del paso del plan: «Activar mi mes gratis» sólo si hay prueba */
    cta: string
    /** El nombre de la promoción («Buen Fin»), si lo tiene */
    label: string | null
    /** Su permanencia (meses, términos y versión), si la tiene */
    commitment: IPlanOfferCommitment | null
}

const trialSpan = (days: number) => days === 30 ? 'un mes' : days === 1 ? 'un día' : `${days} días`

export const planDeal = (plan: IPlan | null | undefined): PlanDeal => {
    if (plan?.offer) {
        const { months, amount } = plan.offer
        const commitment = plan.offer.commitment ?? null
        return {
            kind: 'offer',
            title: `Tus primeros ${months} ${months === 1 ? 'mes' : 'meses'} a ${money(amount)}`,
            detail: commitment
                ? `Después, ${money(plan.price ?? 0)} al mes. Con permanencia de ${commitment.months} meses: si cancelas antes, pagas el descuento de los meses que usaste.`
                : `Después, ${money(plan.price ?? 0)} al mes. Lo cancelas cuando quieras.`,
            short: `${months} ${months === 1 ? 'mes' : 'meses'} a ${money(amount)}`,
            cta: 'Me quedo con este plan',
            label: plan.offer.label ?? null,
            commitment,
        }
    }
    const days = Number(plan?.trial_days ?? 0)
    if (days > 0) {
        const after = plan?.after_trial_offer ?? null
        return {
            kind: 'trial',
            title: `Pruébalo ${trialSpan(days)} gratis`,
            detail: after
                ? `Sin tarjeta y sin pagar hoy. Si te quedas, tus primeros ${after.months} ${after.months === 1 ? 'mes' : 'meses'} a ${money(after.amount)}${after.label ? ` por el ${after.label}` : ''} y después ${money(plan?.price ?? 0)} al mes. Lo cancelas cuando quieras.`
                : 'Sin cobro automático. Cancela cuando quieras.',
            short: days === 30 ? '1 mes gratis' : `${days} ${days === 1 ? 'día' : 'días'} gratis`,
            cta: days === 30 ? 'Activar mi mes gratis' : `Activar mi${days === 1 ? '' : 's'} ${days} ${days === 1 ? 'día' : 'días'} gratis`,
            label: null,
            commitment: null,
        }
    }
    return { kind: 'none', title: null, detail: null, short: null, cta: 'Me quedo con este plan', label: null, commitment: null }
}

/**
 * El plan que se le recomienda en el registro (misma petición para el paso del plan, «Tu cuenta» y el botón).
 * `preferTrial`: la Directora escogió su mes gratis en lugar de la promoción con permanencia (Elite y Área en el Buen
 * Fin): la API le quita la oferta, le deja su prueba y devuelve en `declined_offer` la promoción que dejó.
 * `promo` es esa promoción, la tenga puesta o no: con ella el paso del plan le deja escoger entre las dos.
 */
const useRecommendedPlan = (planKey: PlanKeys | null | undefined, enabled = true, preferTrial = false) => {
    const { response, loading } = useFetchQuery<IPlan>(
        API_ROUTES.SIGN_UP.GET_RECOMMENDED_PLAN.replace('{plan_key}', planKey ?? '') + (preferTrial ? '?prefer_trial=1' : ''),
        {
            customQueryKey: queryKeys.detail('plan', `${planKey ?? ''}${preferTrial ? ':mes-gratis' : ''}`),
            enabled: !!planKey && enabled,
        }
    )
    // Al cambiar entre la promoción y el mes gratis se queda la tarjeta anterior (del mismo plan) mientras llega la otra
    const last = useRef<IPlan | null>(null)
    const fresh = response?.data ?? null
    if (fresh) last.current = fresh
    const plan = fresh ?? (last.current && last.current.plan_key === planKey ? last.current : null)
    const promo = plan?.offer?.commitment ? plan.offer : (plan?.declined_offer ?? null)
    return { plan, loading, deal: planDeal(plan), promo }
}

export default useRecommendedPlan
