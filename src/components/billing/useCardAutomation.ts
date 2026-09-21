import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router'
import { toast } from 'sonner'

import { API_ROUTES } from '@/constants/api'
import useRequestQuery from '@/hooks/useRequestQuery'
import { billingOverviewKey } from './utils'

/**
 * Domiciliar la tarjeta: pide a la API la página de Stripe y se va a ella.
 *
 * Se sale de la web a propósito (redirección completa): la tarjeta la teclea en la página segura de
 * Stripe, nunca aquí. Hoy no se le cobra nada; el primer cobro cae en su próxima fecha de pago.
 */
const useCardAutomation = () => {
    const [starting, setStarting] = useState(false)
    const { request } = useRequestQuery({ onError: () => { } })

    const start = async () => {
        if (starting) return
        setStarting(true)

        try {
            const response = await request<undefined, { checkout_url: string }>('POST', API_ROUTES.BILLING.CARD_AUTOMATION)
            const url = response?.data?.checkout_url

            if (!url) throw new Error('sin liga')

            window.location.assign(url)
        } catch (error) {
            setStarting(false)
            /* La API explica por qué no (deuda, promoción, pago muy próximo…) en palabras para ella */
            const message = (error as { message?: string })?.message
            toast.error(message && message !== 'sin liga' ? message : 'No se pudo abrir la página para domiciliar tu tarjeta. Inténtalo de nuevo.')
        }
    }

    return { start, starting }
}

/**
 * Al volver de Stripe (`?tarjeta=domiciliada|cancelada`): se le confirma una sola vez y se limpia la
 * dirección. La confirmación de verdad la da el webhook, que puede tardar unos segundos en llegar: por
 * eso se vuelve a preguntar el resumen un par de veces, para que su tarjeta aparezca sin recargar.
 */
export const useCardAutomationReturn = () => {
    const [params, setParams] = useSearchParams()
    const queryClient = useQueryClient()
    const result = params.get('tarjeta')

    useEffect(() => {
        if (result !== 'domiciliada' && result !== 'cancelada') return

        if (result === 'domiciliada') {
            toast.success('¡Listo! Tu tarjeta quedó domiciliada. Ya no tendrás que mandar comprobantes: tu plan se cobrará solo cada mes.')
        } else {
            toast('No se domicilió tu tarjeta. Puedes hacerlo cuando quieras desde aquí.')
        }

        /* Sin limpieza a propósito: al borrar el parámetro este efecto se vuelve a correr, y una limpieza
           cancelaría las consultas de seguimiento. Que corran después de salir de la página no daña nada. */
        if (result === 'domiciliada') {
            [0, 4000, 10000].forEach(delay => window.setTimeout(() => queryClient.invalidateQueries({ queryKey: billingOverviewKey }), delay))
        }

        const next = new URLSearchParams(params)
        next.delete('tarjeta')
        setParams(next, { replace: true })
        // Sólo al llegar con el parámetro: después se borra de la dirección
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [result])
}

export default useCardAutomation
