import { useState } from 'react'
import { AlertTriangleIcon, ClockIcon, CreditCardIcon, UploadCloudIcon } from 'lucide-react'

import { Skeleton } from '@/components/ui/skeleton'
import { PaymentStatus } from '@/interfaces/billing'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/utils'
import { formatDate } from '@/utils/dates'
import UploadReceiptDialog from './UploadReceiptDialog'
import useBilling from './useBilling'
import { periodLabel, periodsLabel, receiptTargetFrom, shouldOfferReceipt } from './utils'

/** Cómo se anuncia el estado de cobro: título, color del borde e icono. */
const TONE = {
    overdue: { ring: 'ring-red-300/60 bg-red-500/15', icon: <AlertTriangleIcon aria-hidden /> },
    due: { ring: 'ring-amber-300/60 bg-amber-400/15', icon: <ClockIcon aria-hidden /> },
    review: { ring: 'ring-sky-300/50 bg-sky-400/15', icon: <ClockIcon aria-hidden /> },
    calm: { ring: 'ring-white/15 bg-white/10', icon: <CreditCardIcon aria-hidden /> },
} as const

const dateLabel = (date?: string | null) =>
    date ? formatDate(date, { formatter: { date: 'medium' }, dateOnly: true }) : null

/**
 * Estado de cobro en el sidebar: plan, qué debe y cuándo paga, con acceso directo
 * a subir el comprobante cuando ya le toca o va atrasada.
 *
 * Se apoya en `current_payment`, que la API devuelve ya resuelto, para no tener
 * que decidir aquí qué periodo toca ni si está vencido.
 */
const SidebarBillingCard = () => {
    const { overview, loading, canSeeBilling } = useBilling()
    const [uploadOpen, setUploadOpen] = useState(false)

    if (!canSeeBilling) return null

    if (loading) {
        return (
            <div className="px-3">
                <Skeleton className="h-24 rounded-2xl bg-white/10" />
            </div>
        )
    }

    if (!overview) return null

    const { current_payment: payment, payment_method: paymentMethod } = overview
    const canUpload = shouldOfferReceipt(overview)
    const receiptTarget = receiptTargetFrom(overview)
    const inReview = payment?.status === PaymentStatus.IN_REVIEW

    const tone = payment?.is_overdue
        ? TONE.overdue
        : inReview
            ? TONE.review
            : canUpload
                ? TONE.due
                : TONE.calm

    /* El titular: primero el problema, y si no lo hay, el próximo cobro */
    const headline = payment?.is_overdue
        ? 'Pago atrasado'
        : inReview
            ? 'Comprobante en revisión'
            : canUpload
                ? 'Toca pagar'
                : 'Próximo pago'

    const owedPeriods = overview.debt?.periods ?? []
    const multiple = owedPeriods.length > 1
    /* Con varios meses de deuda manda el total; si no, el periodo en curso o el próximo cobro */
    const amount = multiple ? overview.debt.total : payment ? payment.remaining : overview.next_amount
    const dueDate = dateLabel(payment?.due_date ?? overview.next_charge_date)
    const card = paymentMethod.type === 'automatic' ? paymentMethod.card : null

    return (
        <div className="px-3">
            <div className={cn('rounded-2xl p-3.5 text-white ring-1 ring-inset', tone.ring)}>
                <div className="flex items-center gap-2">
                    <span className="grid size-7 shrink-0 place-content-center rounded-lg bg-white/15 [&>svg]:size-3.5">
                        {tone.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-[12.5px] font-extrabold tracking-tight">{headline}</p>
                        <p className="truncate text-[10.5px] font-semibold text-white/70">
                            {overview.plan?.name ?? 'Sin plan'}
                        </p>
                    </div>
                </div>

                <p className="mt-2.5 text-[22px] leading-none font-extrabold tracking-tight">
                    {formatCurrency(amount, overview.currency)}
                </p>
                <p className="mt-1 text-[10.5px] font-semibold text-white/70">
                    {multiple
                        ? periodsLabel(owedPeriods.map(item => item.period))
                        : payment
                            ? `${periodLabel(payment.period)}${dueDate ? ` · vence el ${dueDate}` : ''}`
                            : dueDate
                                ? `Se cobra el ${dueDate}`
                                : 'Sin fecha de cobro asignada'}
                </p>

                {multiple && (
                    <p className="mt-1 text-[10.5px] font-bold text-white/90">
                        {owedPeriods.length} periodos pendientes{dueDate ? ` · el primero venció el ${dueDate}` : ''}
                    </p>
                )}

                {card && !canUpload && (
                    <p className="mt-1 text-[10.5px] font-semibold text-white/70">
                        Tarjeta ···· {card.last_four}
                    </p>
                )}

                {canUpload && receiptTarget && (
                    <button
                        type="button"
                        onClick={() => setUploadOpen(true)}
                        className="mt-3 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-white px-3 py-2 text-[12px] font-bold text-primary transition-all hover:-translate-y-px hover:shadow-lg [&>svg]:size-3.5"
                    >
                        <UploadCloudIcon aria-hidden />
                        {receiptTarget.hasReceipt ? 'Reemplazar comprobante' : 'Subir comprobante'}
                    </button>
                )}
            </div>

            {receiptTarget && (
                <UploadReceiptDialog
                    open={uploadOpen}
                    periods={receiptTarget.periods}
                    amount={receiptTarget.amount}
                    currency={receiptTarget.currency}
                    paymentMethod={paymentMethod}
                    onOpenChange={setUploadOpen}
                />
            )}
        </div>
    )
}

export default SidebarBillingCard
