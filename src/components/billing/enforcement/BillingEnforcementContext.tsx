import { useCallback, useEffect, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { BILLING_ERROR_CODES, BROWSER_EVENTS } from '@/constants/app'
import { BillingRestrictedFeature, IBillingRestrictedEvent } from '@/interfaces/billing'
import { BrowserEvent, subscribeEvent, unsubscribeEvent } from '@/utils/events'
import UploadReceiptDialog from '../UploadReceiptDialog'
import useBilling from '../useBilling'
import { billingOverviewKey } from '../utils'
import AccountBlockedWall from './AccountBlockedWall'
import { BillingEnforcementContext, BillingEnforcementValue } from './context'
import PaymentPendingDialog, { PendingDialogKind } from './PaymentPendingDialog'
import { markReminderShown, NO_ENFORCEMENT, wasReminderShownToday } from './utils'

interface DialogState {
    kind: PendingDialogKind
    feature?: BillingRestrictedFeature
}

/**
 * Escalada por atraso en el pago.
 *
 * El estado viene resuelto de la API (`current_payment.enforcement`) y vive en
 * react-query, así que aquí no se duplica: lo que añade este provider es la
 * orquestación de UI que hay que disparar desde cualquier punto del árbol —abrir
 * el aviso, recordar que ya se mostró hoy, pintar el muro— y los modales que
 * esa orquestación necesita, que se montan una sola vez en la raíz.
 */
interface Props {
    children: React.ReactNode
    /** Lo que se pinta mientras el overview no ha respondido: la shell de arranque. */
    fallback: React.ReactNode
}

export const BillingEnforcementProvider = ({ children, fallback }: Props) => {
    const { overview, loading } = useBilling()
    const queryClient = useQueryClient()

    const [dialog, setDialog] = useState<DialogState | null>(null)
    const [uploadOpen, setUploadOpen] = useState(false)
    /*
     * Cada 403 de cuenta bloqueada suma uno. Sirve de dos cosas: levantar el muro
     * al instante aunque la caché del overview todavía diga que no está bloqueada,
     * y remontarlo (va de `key`) si alguien lo quitó del DOM a mano.
     */
    const [blockedSignal, setBlockedSignal] = useState(0)

    const payment = overview?.current_payment ?? null
    const paymentMethod = overview?.payment_method
    const enforcement = payment?.enforcement ?? NO_ENFORCEMENT

    const isFeatureRestricted = useCallback(
        (feature: BillingRestrictedFeature) => enforcement.restricted_features.includes(feature),
        [enforcement.restricted_features],
    )

    const openPaymentDialog = useCallback(
        (feature?: BillingRestrictedFeature) => setDialog({ kind: feature ? 'restricted' : 'pending', feature }),
        [],
    )

    const requestFeature = useCallback((feature: BillingRestrictedFeature) => {
        if (!isFeatureRestricted(feature)) return true

        openPaymentDialog(feature)
        return false
    }, [isFeatureRestricted, openPaymentDialog])

    const openUploadReceipt = useCallback(() => {
        setDialog(null)
        setUploadOpen(true)
    }, [])

    /* Recordatorio al entrar: una vez al día mientras la API lo pida */
    useEffect(() => {
        if (!payment || !enforcement.show_reminder_popup) return
        if (wasReminderShownToday(payment.period)) return

        markReminderShown(payment.period)
        setDialog({ kind: 'reminder' })
    }, [payment?.period, enforcement.show_reminder_popup]) // eslint-disable-line react-hooks/exhaustive-deps

    /*
     * La puerta real la pone la API: si algún endpoint responde 403 por atraso, se
     * refresca el estado (la caché puede ir por detrás del día) y se abre el aviso.
     * Cubre deep links y cualquier ruta que no pase por requestFeature.
     */
    useEffect(() => {
        const onRestricted = (event: BrowserEvent<IBillingRestrictedEvent>) => {
            queryClient.invalidateQueries({ queryKey: billingOverviewKey })

            if (event.detail.code === BILLING_ERROR_CODES.FEATURE_RESTRICTED) {
                setDialog({ kind: 'restricted', feature: event.detail.feature })
            }

            if (event.detail.code === BILLING_ERROR_CODES.ACCOUNT_BLOCKED) {
                setDialog(null)
                setBlockedSignal(count => count + 1)
            }
        }

        subscribeEvent(BROWSER_EVENTS.BILLING_RESTRICTED, onRestricted as EventListener)
        return () => unsubscribeEvent(BROWSER_EVENTS.BILLING_RESTRICTED, onRestricted as EventListener)
    }, [queryClient])

    /* Cuando el overview vuelve fresco y dice que no está bloqueada, la señal deja de mandar */
    useEffect(() => {
        if (overview && !enforcement.account_blocked) setBlockedSignal(0)
    }, [overview, enforcement.account_blocked])

    const showBlockedWall = enforcement.account_blocked || blockedSignal > 0

    /*
     * Segunda puerta del arranque: nada de la app se monta hasta que el overview se
     * asienta. Con éxito o con error da igual —si falla, la escalada queda en "nada"
     * y la app sigue—; lo que no puede pasar es que una página pida antes que él.
     */
    const ready = !loading

    const value = useMemo<BillingEnforcementValue>(() => ({
        enforcement,
        payment,
        paymentMethod,
        isFeatureRestricted,
        requestFeature,
        openPaymentDialog,
        openUploadReceipt,
    }), [enforcement, payment, paymentMethod, isFeatureRestricted, requestFeature, openPaymentDialog, openUploadReceipt])

    return (
        <BillingEnforcementContext.Provider value={value}>
            {ready ? children : fallback}

            {payment && (
                <>
                    <PaymentPendingDialog
                        open={dialog !== null}
                        kind={dialog?.kind ?? 'pending'}
                        feature={dialog?.feature}
                        payment={payment}
                        onUpload={openUploadReceipt}
                        onOpenChange={open => !open && setDialog(null)}
                    />

                    <UploadReceiptDialog
                        open={uploadOpen}
                        period={payment.period}
                        amount={payment.remaining}
                        currency={payment.currency}
                        paymentMethod={paymentMethod}
                        onOpenChange={setUploadOpen}
                    />
                </>
            )}

            {/* Sin `payment` (overview aún sin cargar) el muro sale igual, con el texto genérico */}
            {showBlockedWall && (
                <AccountBlockedWall
                    key={blockedSignal}
                    payment={payment}
                    paymentMethod={paymentMethod}
                    onUpload={openUploadReceipt}
                />
            )}
        </BillingEnforcementContext.Provider>
    )
}
