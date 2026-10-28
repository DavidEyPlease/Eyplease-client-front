import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { CalendarClockIcon, CreditCardIcon, LoaderCircleIcon, SparklesIcon } from 'lucide-react'
import { toast } from 'sonner'

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { API_ROUTES } from '@/constants/api'
import useStandardQuote, { STANDARD_QUOTE_KEY, StandardQuote, StandardSubscription } from '@/hooks/useStandardQuote'
import { ApiResponse } from '@/interfaces/common'
import { PermissionKeys } from '@/interfaces/permissions'
import HttpService from '@/services/http'
import useAuthStore from '@/store/auth'
import useBilling from './useBilling'
import { billingOverviewKey } from './utils'

const BRANDS: Record<string, string> = { visa: 'Visa', mastercard: 'Mastercard', amex: 'American Express', american_express: 'American Express' }
const cardLabel = (card: StandardSubscription['card']) => card
    ? `${BRANDS[(card.brand ?? '').toLowerCase()] ?? (card.brand ? card.brand.charAt(0).toUpperCase() + card.brand.slice(1) : 'Tarjeta')} •••• ${card.last4}`
    : null
const money = (value: number) => `$${Math.round(value).toLocaleString('es-MX')}`

/**
 * El Plan Standard que se cobra a su tarjeta, en Pagos: cuánto, cuándo y con qué tarjeta, y cancelarlo o reanudarlo
 * ELLA SOLA, sin escribirnos (David, 28-oct-2026). Al cancelar no se le cobra más y lo sigue usando hasta el fin del mes
 * que ya pagó; ese día baja sola a la Gratis. Sólo para consultoras con suscripción (no depende del interruptor de
 * «Tu estrategia»: si ya paga, siempre tiene que poder cancelarlo).
 */
const StandardPlanCard = () => {
    const consultant = useAuthStore(state => !!state.user && (state.user.plan?.audience === 'clients' || !state.permissions.includes(PermissionKeys.POSTS_UNITY)))
    const { data: quote } = useStandardQuote(consultant)
    const { overview } = useBilling()
    const queryClient = useQueryClient()
    const [asking, setAsking] = useState(false)
    const [busy, setBusy] = useState<'cancel' | 'resume' | null>(null)

    const subscription = quote?.subscription
    if (!consultant || !subscription) return null

    const amount = quote?.monthly ?? overview?.next_amount ?? null
    const card = cardLabel(subscription.card)

    const run = async (action: 'cancel' | 'resume') => {
        setBusy(action)
        try {
            const res = await HttpService.post<ApiResponse<StandardSubscription>>(action === 'cancel' ? API_ROUTES.BILLING.STANDARD_CANCEL : API_ROUTES.BILLING.STANDARD_RESUME, {})
            const next = res.data
            queryClient.setQueryData<StandardQuote | null>(STANDARD_QUOTE_KEY, current => current ? { ...current, subscription: next } : current)
            queryClient.invalidateQueries({ queryKey: STANDARD_QUOTE_KEY })
            queryClient.invalidateQueries({ queryKey: billingOverviewKey })
            toast.success(action === 'cancel'
                ? `Listo: tu Plan Standard termina el ${next?.ends_at_label ?? subscription.next_charge_label ?? 'fin de tu mes'}. Ya no se te cobra.`
                : `Listo: tu Plan Standard sigue.${next?.next_charge_label ? ` Próximo cobro: ${next.next_charge_label}.` : ''}`)
        } catch (error) {
            toast.error((error as { message?: string })?.message || 'No se pudo hacer el cambio. Inténtalo otra vez.')
        } finally {
            setBusy(null)
            setAsking(false)
        }
    }

    return (
        <section className="rounded-3xl border bg-card px-5 py-4 shadow-card">
            <div className="flex flex-wrap items-start gap-3.5">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[linear-gradient(135deg,#E5077D,#6C47FF)] text-white">
                    <SparklesIcon className="size-5" />
                </span>
                <div className="min-w-[220px] flex-1">
                    <p className="text-[11px] font-extrabold tracking-[.14em] text-[#C0066A] uppercase dark:text-[#FF7AC0]">Tu estrategia</p>
                    <h3 className="text-[17px] leading-tight font-extrabold">Plan Standard{amount ? <span className="font-semibold text-muted-foreground"> · {money(amount)} al mes</span> : null}</h3>

                    {subscription.canceled ? (
                        <p className="mt-1.5 flex items-start gap-1.5 text-[13.5px] leading-snug">
                            <CalendarClockIcon className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                            <span>Tu Plan Standard termina el <b>{subscription.ends_at_label}</b>. Ya no se te cobra.</span>
                        </p>
                    ) : (
                        <div className="mt-1.5 grid gap-1 text-[13.5px] leading-snug text-muted-foreground">
                            {subscription.next_charge_label && (
                                <p className="flex items-center gap-1.5"><CalendarClockIcon className="size-4 shrink-0" /> Próximo cobro: <b className="text-foreground">{subscription.next_charge_label}</b></p>
                            )}
                            {card && <p className="flex items-center gap-1.5"><CreditCardIcon className="size-4 shrink-0" /> {card}</p>}
                        </div>
                    )}
                </div>

                {subscription.canceled ? (
                    <div className="grid justify-items-end gap-1">
                        <button type="button" onClick={() => run('resume')} disabled={!!busy} className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full bg-primary-gradient px-5 text-[13.5px] font-bold text-white shadow-primary-glow disabled:opacity-70">
                            {busy === 'resume' && <LoaderCircleIcon className="size-4 animate-spin" />} Reanudar mi plan
                        </button>
                        <small className="text-[11.5px] text-muted-foreground">Sin cobro hoy</small>
                    </div>
                ) : (
                    <button type="button" onClick={() => setAsking(true)} className="cursor-pointer self-center text-[13px] font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
                        Cancelar mi plan
                    </button>
                )}
            </div>

            <AlertDialog open={asking} onOpenChange={open => { if (!busy) setAsking(open) }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Cancelar tu Plan Standard?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Lo sigues usando hasta el {subscription.next_charge_label ?? 'fin del mes que ya pagaste'} y ya no se te cobra más. Si cambias de opinión antes de ese día, lo reanudas aquí mismo.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={!!busy}>Mejor no</AlertDialogCancel>
                        <AlertDialogAction
                            disabled={!!busy}
                            onClick={event => { event.preventDefault(); run('cancel') }}
                            className="bg-[#E5484D] text-white hover:bg-[#d23f44]"
                        >
                            {busy === 'cancel' ? <LoaderCircleIcon className="size-4 animate-spin" /> : 'Sí, cancelar'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </section>
    )
}

export default StandardPlanCard
