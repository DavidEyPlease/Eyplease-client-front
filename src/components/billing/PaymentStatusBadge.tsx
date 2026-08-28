import { PaymentStatus } from '@/interfaces/billing'
import { cn } from '@/lib/utils'
import { PAYMENT_STATUS_UI } from './utils'

interface Props {
    status: PaymentStatus
    className?: string
}

/** Estado de un periodo, con la etiqueta que entiende el cliente. */
const PaymentStatusBadge = ({ status, className }: Props) => {
    const ui = PAYMENT_STATUS_UI[status] ?? PAYMENT_STATUS_UI[PaymentStatus.PENDING]

    return (
        <span className={cn('w-fit rounded-full px-2.5 py-1 text-[11px] font-bold whitespace-nowrap', ui.className, className)}>
            {ui.label}
        </span>
    )
}

export default PaymentStatusBadge
