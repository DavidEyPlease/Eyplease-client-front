import { AlertTriangleIcon, UploadCloudIcon } from 'lucide-react'

import { formatCurrency } from '@/utils'
import { formatDate } from '@/utils/dates'
import { periodLabel } from '../utils'
import { useBillingEnforcement } from './context'
import { daysLabel } from './utils'

/**
 * Barra de pago pendiente en todas las pantallas. Vive en el layout, así que no
 * se vuelve a montar al navegar: está "en cada page" sin repetirse en cada page.
 * Con la cuenta atrás activa deja de hablar del atraso y avisa del bloqueo.
 */
const GlobalPaymentBanner = () => {
    const { enforcement, payment, openPaymentDialog, openUploadReceipt } = useBillingEnforcement()

    if (!payment || !enforcement.show_global_banner || enforcement.account_blocked) return null

    const countdown = enforcement.days_until_block
    const blockDate = enforcement.block_date
        ? formatDate(enforcement.block_date, { formatter: { date: 'medium' }, dateOnly: true })
        : null

    return (
        <div
            role="alert"
            className="mx-4 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
        >
            <AlertTriangleIcon className="size-4 shrink-0" aria-hidden />

            <p className="min-w-0 flex-1 text-[13px] font-semibold">
                {countdown !== null ? (
                    <>
                        Tu cuenta se bloqueará en <strong>{daysLabel(countdown)}</strong>
                        {blockDate && ` (${blockDate})`}. Paga {formatCurrency(payment.remaining, payment.currency)} de {periodLabel(payment.period)} para evitarlo.
                    </>
                ) : (
                    <>
                        Pago pendiente de <strong>{periodLabel(payment.period)}</strong> · {formatCurrency(payment.remaining, payment.currency)} · {daysLabel(enforcement.days_overdue)} de atraso
                    </>
                )}
            </p>

            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => openPaymentDialog()}
                    className="cursor-pointer text-[12.5px] font-bold underline-offset-2 hover:underline"
                >
                    Ver detalle
                </button>
                {payment.can_upload_receipt && (
                    <button
                        type="button"
                        onClick={openUploadReceipt}
                        className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-[12px] font-bold text-white transition hover:bg-red-700 [&>svg]:size-3.5"
                    >
                        <UploadCloudIcon aria-hidden />
                        Subir comprobante
                    </button>
                )}
            </div>
        </div>
    )
}

export default GlobalPaymentBanner
