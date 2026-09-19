import { useState } from 'react'
import { Link } from 'react-router'
import { AlertTriangleIcon, CalendarClockIcon, CheckCircle2Icon, ClockIcon, CreditCardIcon, LandmarkIcon, UploadCloudIcon, WalletIcon } from 'lucide-react'

import { APP_ROUTES } from '@/constants/app'
import { IBillingOverview } from '@/interfaces/billing'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/utils'
import UploadReceiptDialog from './UploadReceiptDialog'
import useBilling from './useBilling'
import { billingStatusFrom, BillingTone } from './utils'

/** A dónde lleva todo lo de pagos: la ficha del perfil, que acepta la sección por la dirección */
export const BILLING_PATH = `${APP_ROUTES.HOME.PROFILE}?section=billing`

/** Cómo se dice cada estado en corto, con su color. Nunca rojo si no debe nada. */
const STATE: Record<BillingTone, { label: string, badge: string, Icon: typeof ClockIcon }> = {
    calm: { label: 'Al corriente', badge: 'bg-emerald-500/14 text-emerald-700 dark:text-emerald-400', Icon: CheckCircle2Icon },
    due: { label: 'Toca pagar', badge: 'bg-amber-500/15 text-amber-700 dark:text-amber-400', Icon: ClockIcon },
    review: { label: 'En revisión', badge: 'bg-sky-500/14 text-sky-700 dark:text-sky-400', Icon: ClockIcon },
    overdue: { label: 'Pago atrasado', badge: 'bg-red-500/14 text-red-700 dark:text-red-400', Icon: AlertTriangleIcon },
}

const TAG = 'inline-flex h-[22px] shrink-0 items-center gap-1.5 rounded-full px-2.5 text-[10.5px] font-bold tracking-wide whitespace-nowrap'

const methodLabel = (overview: IBillingOverview) => {
    const method = overview.payment_method
    if (method.type !== 'automatic') return { title: 'Transferencia o efectivo', hint: 'Pagas tú y subes tu comprobante' }
    return method.card
        ? { title: `Tarjeta ···· ${method.card.last_four}`, hint: 'Se cobra sola cada periodo' }
        : { title: 'Tarjeta sin registrar', hint: 'Escríbenos para actualizarla' }
}

/**
 * «Tu suscripción», en grande: qué plan tiene, cuánto y cuándo paga, por dónde, y si debe algo, con
 * el botón de subir el comprobante cuando toca. Es lo que en el marco de siempre decía la tarjeta
 * del menú lateral, que en el marco nuevo no existe.
 */
const SubscriptionCard = () => {
    const { overview, loading } = useBilling()
    const [uploadOpen, setUploadOpen] = useState(false)

    if (loading) return <span className="hoy-skel block h-44 rounded-[22px]" />
    if (!overview) return null

    const status = billingStatusFrom(overview)
    const state = STATE[status.tone]
    const method = methodLabel(overview)
    const isAutomatic = overview.payment_method.type === 'automatic'

    const tiles = [
        { Icon: WalletIcon, label: 'Tu plan', title: status.planName, hint: overview.plan ? `${formatCurrency(overview.plan.price, overview.currency)} al mes` : 'Sin plan asignado' },
        { Icon: CalendarClockIcon, label: 'Día de pago', title: overview.payment_day ? `Cada día ${overview.payment_day}` : 'Sin día asignado', hint: isAutomatic ? 'Cobro automático' : 'Cobro manual' },
        { Icon: isAutomatic ? CreditCardIcon : LandmarkIcon, label: 'Forma de pago', title: method.title, hint: method.hint },
        { Icon: CheckCircle2Icon, label: 'Saldo pendiente', title: formatCurrency(overview.balance, overview.currency), hint: overview.balance > 0 ? `${overview.unpaid_periods} ${overview.unpaid_periods === 1 ? 'periodo' : 'periodos'} por pagar` : 'Estás al día' },
    ]

    return (
        <section className="shell-glass hoy-edge rounded-[22px] p-5">
            <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-[15px] font-extrabold tracking-tight">Tu suscripción</h2>
                        <span className={cn(TAG, state.badge)}><state.Icon className="size-3" /> {state.label}</span>
                    </div>
                    <p className="mt-2.5 text-[11px] font-extrabold tracking-wider text-muted-foreground uppercase">{status.headline}</p>
                    <p className="text-[34px] leading-tight font-extrabold tracking-tight tabular-nums">{formatCurrency(status.amount, status.currency)}</p>
                    <p className="text-[13px] text-muted-foreground">{status.detail}</p>
                    {status.extra && <p className="mt-0.5 text-[12.5px] font-bold text-red-600 dark:text-red-400">{status.extra}</p>}
                </div>

                {status.canUpload && status.receiptTarget && (
                    <button type="button" onClick={() => setUploadOpen(true)} className="hoy-cta flex h-11 cursor-pointer items-center gap-2 rounded-[13px] px-5 text-[13.5px] font-bold text-white">
                        <UploadCloudIcon className="size-4" /> {status.receiptTarget.hasReceipt ? 'Reemplazar comprobante' : 'Subir comprobante'}
                    </button>
                )}
            </div>

            {/* De dos en dos mientras la columna sea angosta (perfil + Asistente abierto): en cuatro se cortaban las cifras */}
            <div className="mt-5 grid grid-cols-2 gap-2.5 min-[1560px]:grid-cols-4">
                {tiles.map(tile => (
                    <div key={tile.label} className="rounded-2xl border border-border bg-card/60 p-3.5">
                        <p className="flex items-center gap-1.5 text-[10.5px] font-extrabold tracking-wider text-muted-foreground uppercase"><tile.Icon className="size-3.5 text-primary" /> {tile.label}</p>
                        <p className="mt-1.5 text-[14.5px] leading-snug font-extrabold tracking-tight">{tile.title}</p>
                        <p className="text-[11.5px] leading-snug text-muted-foreground">{tile.hint}</p>
                    </div>
                ))}
            </div>

            {status.receiptTarget && (
                <UploadReceiptDialog
                    open={uploadOpen}
                    periods={status.receiptTarget.periods}
                    amount={status.receiptTarget.amount}
                    currency={status.receiptTarget.currency}
                    paymentMethod={overview.payment_method}
                    onOpenChange={setUploadOpen}
                />
            )}
        </section>
    )
}

/**
 * La misma lectura, en una fila: para la columna del Hoy y para el menú de la cuenta. Lleva a la
 * ficha de pagos. A las cuentas que se cobran por fuera de la app no les pinta nada.
 */
export const SubscriptionRow = ({ className, onNavigate }: { className?: string, onNavigate?: () => void }) => {
    const { overview, canSeeBilling } = useBilling()
    if (!canSeeBilling || !overview) return null

    const status = billingStatusFrom(overview)
    const state = STATE[status.tone]

    return (
        <Link to={BILLING_PATH} onClick={onNavigate} className={cn('flex items-center gap-3 transition-colors', className)}>
            <span className="hoy-soft grid size-10 shrink-0 place-items-center rounded-xl text-primary"><WalletIcon className="size-[18px]" /></span>
            <span className="min-w-0 flex-1 leading-tight">
                <b className="block truncate text-[13px] font-extrabold">{status.planName} · {formatCurrency(status.amount, status.currency)}</b>
                <small className="block truncate text-[11.5px] text-muted-foreground">{status.detail}</small>
            </span>
            <span className={cn(TAG, state.badge)}>{state.label}</span>
        </Link>
    )
}

export default SubscriptionCard
