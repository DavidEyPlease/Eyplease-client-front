import { IBillingOverview, PaymentMethod, PaymentStatus } from '@/interfaces/billing'
import { queryKeys } from '@/utils/cache'

/** Una sola clave para el resumen: sidebar y perfil comparten petición y se invalidan juntos. */
export const billingOverviewKey = queryKeys.generic('billing-overview')
export const billingPaymentsKey = queryKeys.entity('billing-payments')

/** Cómo se pinta cada estado: etiqueta para el cliente y color del distintivo. */
export const PAYMENT_STATUS_UI: Record<PaymentStatus, { label: string, className: string }> = {
    [PaymentStatus.PAID]: { label: 'Pagado', className: 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400' },
    [PaymentStatus.IN_REVIEW]: { label: 'En revisión', className: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400' },
    [PaymentStatus.PARTIAL]: { label: 'Pago parcial', className: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400' },
    [PaymentStatus.OVERDUE]: { label: 'Atrasado', className: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400' },
    [PaymentStatus.PENDING]: { label: 'Por pagar', className: 'bg-muted text-muted-foreground' },
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
    [PaymentMethod.STRIPE]: 'Tarjeta automática',
    [PaymentMethod.CARD]: 'Tarjeta',
    [PaymentMethod.TRANSFER]: 'Transferencia',
    [PaymentMethod.CASH]: 'Efectivo',
}

/** Medios que el cliente puede comprobar por su cuenta (la tarjeta la cobra Stripe). */
export const RECEIPT_METHODS = [
    { value: PaymentMethod.TRANSFER, label: 'Transferencia' },
    { value: PaymentMethod.CASH, label: 'Efectivo' },
] as const

const MONTHS = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

/** "2026-08" → "Agosto 2026". El periodo no es una fecha: no pasa por zonas horarias. */
export const periodLabel = (period: string): string => {
    const [year, month] = period.split('-')
    const name = MONTHS[Number(month) - 1]

    return name ? `${name} ${year}` : period
}

const joinWithAnd = (items: string[]) =>
    items.length <= 1 ? items.join('') : `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}`

/**
 * Varios periodos en una frase: "Julio y Agosto 2026", o "Diciembre 2025 y Enero 2026"
 * si cruzan de año. Con uno solo, igual que periodLabel.
 */
export const periodsLabel = (periods: string[]): string => {
    if (!periods.length) return ''

    const years = new Set(periods.map(period => period.split('-')[0]))
    if (years.size > 1) return joinWithAnd(periods.map(periodLabel))

    const months = periods.map(period => MONTHS[Number(period.split('-')[1]) - 1] ?? period)
    return `${joinWithAnd(months)} ${[...years][0]}`
}

/**
 * Si tiene sentido ofrecerle subir el comprobante desde el sidebar.
 *
 * Al de pago automático solo se le ofrece cuando el cobro ya se atrasó: mientras
 * Stripe pueda cobrarle solo, mandarlo a comprobar a mano sobra.
 */
export const shouldOfferReceipt = (overview?: IBillingOverview): boolean => {
    const payment = overview?.current_payment
    if (!payment?.can_upload_receipt) return false

    return payment.is_overdue || (overview?.billing_type === 'manual' && payment.is_due)
}

/** A qué periodos va un comprobante y cuánto cubre. */
export interface IReceiptTarget {
    periods: string[]
    amount: number
    currency: string
    hasReceipt: boolean
}

/**
 * El objetivo del comprobante desde el resumen: todos los periodos que debe (una
 * transferencia suele cubrirlos juntos) o, si ya los mandó todos a revisión, el
 * periodo en curso para poder reemplazarlo.
 */
export const receiptTargetFrom = (overview?: IBillingOverview): IReceiptTarget | null => {
    const payment = overview?.current_payment
    if (!payment?.can_upload_receipt) return null

    const owed = overview?.debt?.periods ?? []
    if (owed.length) {
        return { periods: owed.map(item => item.period), amount: overview!.debt.total, currency: overview!.debt.currency, hasReceipt: false }
    }

    return { periods: [payment.period], amount: payment.remaining, currency: payment.currency, hasReceipt: payment.has_receipt }
}

/** Formatos que acepta un comprobante: foto del banco o PDF del estado de cuenta. */
export const RECEIPT_ACCEPTED_FILES = 'image/*,application/pdf'
export const RECEIPT_MAX_SIZE_MB = 8
