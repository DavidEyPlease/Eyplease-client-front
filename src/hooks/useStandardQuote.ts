import { useQuery } from '@tanstack/react-query'

import { API_ROUTES } from '@/constants/api'
import { ApiResponse } from '@/interfaces/common'
import HttpService from '@/services/http'
import useAuthStore from '@/store/auth'
import { ICashPayment } from '@/interfaces/billing'

/** Su suscripción del Standard a tarjeta (Stripe), para pintarla en Pagos y cancelarla o reanudarla ella sola. */
export interface StandardSubscription {
    status: string
    /** Ya la canceló: no se le cobra más y termina en `ends_at` */
    canceled: boolean
    ends_at: string | null
    /** «28 de noviembre» */
    ends_at_label: string | null
    next_charge_date: string | null
    next_charge_label: string | null
    card: { brand: string | null, last4: string } | null
}

/** Lo que manda `GET billing/standard` (StandardSubscriptionService::quote, API 651f890 + 7d133a5). */
export interface StandardQuote {
    available: boolean
    /** Por qué no puede ella sola: plan · apagado · contacto · automatica · prueba · ya_lo_tiene · descuento */
    reason: string | null
    /** Ya en palabras para ella */
    message: string | null
    whatsapp: string | null
    current: { key: string, name: string } | null
    plan: { key: string, name: string, color: string | null, features: string[] } | null
    currency: string
    monthly?: number
    /** Lo que paga hoy (con la oferta, el precio de la oferta) */
    due_now?: number
    /** Oferta de lanzamiento: sus primeros `months` meses a `amount` */
    offer?: { months: number, amount: number } | null
    /** Nula si no tiene un Standard que se cobre a su tarjeta */
    subscription?: StandardSubscription | null
    /** Cómo puede contratarlo (sólo con `available`): con OXXO necesita correo en su perfil */
    methods?: { card: boolean, oxxo: boolean, transfer: boolean, oxxo_needs_email: boolean }
    /** La ficha o transferencia que pidió para contratarlo y aún no se confirma */
    cash_pending?: ICashPayment | null
}

export const STANDARD_QUOTE_KEY = ['billing', 'standard']

/** Cuánto le cuesta el Plan Standard hoy y cada mes, o por qué no puede contratarlo sola. */
const useStandardQuote = (enabled = true) => {
    const ready = useAuthStore(state => enabled && !!state.user && !state.initialLoading)
    return useQuery({
        queryKey: STANDARD_QUOTE_KEY,
        queryFn: async () => (await HttpService.get<ApiResponse<StandardQuote>>(API_ROUTES.BILLING.STANDARD)).data ?? null,
        staleTime: 5 * 60 * 1000,
        retry: false,
        enabled: ready,
    })
}

/** «Tus primeros 3 meses a $99 y después $139 al mes» / «$139 al mes» */
export const standardPriceLine = (quote: StandardQuote | null | undefined) => {
    if (!quote?.available || !quote.monthly) return null
    const money = (value: number) => `$${Math.round(value).toLocaleString('es-MX')}`
    return quote.offer
        ? `Tus primeros ${quote.offer.months} meses a ${money(quote.offer.amount)} y después ${money(quote.monthly)} al mes`
        : `${money(quote.monthly)} al mes`
}

export default useStandardQuote
