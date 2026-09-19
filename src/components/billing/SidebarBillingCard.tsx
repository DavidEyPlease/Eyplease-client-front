import { useState } from 'react'
import { AlertTriangleIcon, ClockIcon, CreditCardIcon, UploadCloudIcon } from 'lucide-react'

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/utils'
import UploadReceiptDialog from './UploadReceiptDialog'
import useBilling from './useBilling'
import { billingStatusFrom } from './utils'

/** Cómo se anuncia el estado de cobro: título, color del borde e icono. */
const TONE = {
    overdue: { ring: 'ring-red-300/60 bg-red-500/15', icon: <AlertTriangleIcon aria-hidden /> },
    due: { ring: 'ring-amber-300/60 bg-amber-400/15', icon: <ClockIcon aria-hidden /> },
    review: { ring: 'ring-sky-300/50 bg-sky-400/15', icon: <ClockIcon aria-hidden /> },
    calm: { ring: 'ring-white/15 bg-white/10', icon: <CreditCardIcon aria-hidden /> },
} as const

/**
 * Estado de cobro en el sidebar: plan, qué debe y cuándo paga, con acceso directo
 * a subir el comprobante cuando ya le toca o va atrasada.
 *
 * Qué se anuncia lo decide `billingStatusFrom`, que comparte con las tarjetas del marco nuevo.
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

    const status = billingStatusFrom(overview)
    const tone = TONE[status.tone]
    const { receiptTarget } = status

    return (
        <div className="px-3">
            <div className={cn('rounded-2xl p-3.5 text-white ring-1 ring-inset', tone.ring)}>
                <div className="flex items-center gap-2">
                    <span className="grid size-7 shrink-0 place-content-center rounded-lg bg-white/15 [&>svg]:size-3.5">
                        {tone.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-[12.5px] font-extrabold tracking-tight">{status.headline}</p>
                        <p className="truncate text-[10.5px] font-semibold text-white/70">
                            {status.planName}
                        </p>
                    </div>
                </div>

                <p className="mt-2.5 text-[22px] leading-none font-extrabold tracking-tight">
                    {formatCurrency(status.amount, status.currency)}
                </p>
                <p className="mt-1 text-[10.5px] font-semibold text-white/70">{status.detail}</p>

                {status.extra && (
                    <p className="mt-1 text-[10.5px] font-bold text-white/90">{status.extra}</p>
                )}

                {status.cardLastFour && (
                    <p className="mt-1 text-[10.5px] font-semibold text-white/70">
                        Tarjeta ···· {status.cardLastFour}
                    </p>
                )}

                {status.canUpload && receiptTarget && (
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
                    paymentMethod={overview.payment_method}
                    onOpenChange={setUploadOpen}
                />
            )}
        </div>
    )
}

export default SidebarBillingCard
