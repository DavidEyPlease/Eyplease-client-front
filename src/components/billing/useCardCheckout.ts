import { useCallback, useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import HttpService from '@/services/http'
import { API_ROUTES } from '@/constants/api'
import { ApiResponse } from '@/interfaces/common'
import { IBillingOverview, ICardCheckout } from '@/interfaces/billing'
import { billingOverviewKey, billingPaymentsKey } from './utils'

/** Tras volver de la página de pago el webhook puede tardar unos segundos: se vuelve a preguntar. */
const REFRESH_AFTER_MS = [0, 4000, 10000]

/** ¿Se le ofrece pagar con tarjeta? Lo decide la API: cuenta de cobro manual, método encendido y algo por pagar. */
export const canPayWithCard = (overview?: IBillingOverview): boolean => {
    const method = overview?.payment_method
    if (method?.type !== 'manual' || !method.card_checkout?.enabled) return false

    return (overview?.debt?.periods.length ?? 0) > 0
}

const messageOf = (error: unknown, fallback: string) => {
    const message = (error as { message?: unknown } | null)?.message
    return typeof message === 'string' && message.trim() ? message : fallback
}

/**
 * Pago con tarjeta: pide la liga a la API (meses e importes los pone ella, del libro de pagos), la abre en
 * otra pestaña y, al volver a ésta, refresca el estado de cuenta. La web nunca ve ni guarda la tarjeta.
 */
const useCardCheckout = () => {
    const queryClient = useQueryClient()
    const [starting, setStarting] = useState(false)
    const [checkout, setCheckout] = useState<ICardCheckout | null>(null)
    const [error, setError] = useState('')
    const timers = useRef<ReturnType<typeof setTimeout>[]>([])

    const refreshBilling = useCallback(() => {
        timers.current.forEach(clearTimeout)
        timers.current = REFRESH_AFTER_MS.map(delay => setTimeout(() => {
            queryClient.invalidateQueries({ queryKey: billingOverviewKey })
            queryClient.invalidateQueries({ queryKey: billingPaymentsKey })
        }, delay))
    }, [queryClient])

    // Al volver a esta pestaña se revisa si el pago ya quedó
    useEffect(() => {
        if (!checkout) return

        const onVisible = () => { if (document.visibilityState === 'visible') refreshBilling() }
        document.addEventListener('visibilitychange', onVisible)
        return () => document.removeEventListener('visibilitychange', onVisible)
    }, [checkout, refreshBilling])

    useEffect(() => () => timers.current.forEach(clearTimeout), [])

    const open = (url: string) => {
        // Si el navegador bloquea la pestaña nueva, se paga en ésta: la página de regreso la trae de vuelta
        if (!window.open(url, '_blank', 'noopener')) window.location.href = url
    }

    /** `periods` = hasta qué mes paga (siempre desde el más viejo). Sin él, todo lo que debe. */
    const start = async (periods?: string[]) => {
        setError('')
        setStarting(true)
        try {
            const response = await HttpService.post<ApiResponse<ICardCheckout>>(
                API_ROUTES.BILLING.CARD_CHECKOUT, periods?.length ? { periods } : {}
            )
            if (!response.data) throw new Error('No se pudo abrir el pago')
            setCheckout(response.data)
            open(response.data.checkout_url)
        } catch (err) {
            setError(messageOf(err, 'No se pudo abrir el pago con tarjeta'))
            // Puede haberse pagado por otro lado mientras tanto: que la pantalla diga la verdad
            refreshBilling()
        } finally {
            setStarting(false)
        }
    }

    const reset = () => { setCheckout(null); setError('') }

    return { start, starting, checkout, error, reopen: () => checkout && open(checkout.checkout_url), refreshBilling, reset }
}

export default useCardCheckout
