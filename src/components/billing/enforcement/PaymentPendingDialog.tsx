import { AlertTriangleIcon, LockIcon } from 'lucide-react'
import { useNavigate } from 'react-router'

import Button from '@/components/common/Button'
import Modal from '@/components/common/Modal'
import { BillingRestrictedFeature, ICurrentPayment } from '@/interfaces/billing'
import { formatCurrency } from '@/utils'
import { formatDate } from '@/utils/dates'
import { periodLabel } from '../utils'
import { daysLabel, PROFILE_BILLING_PATH, RESTRICTED_FEATURE_LABELS } from './utils'

/**
 * reminder   → al entrar, los primeros días de atraso.
 * restricted → intentó abrir algo que su atraso tiene cerrado.
 * pending    → lo abrió ella desde un banner.
 */
export type PendingDialogKind = 'reminder' | 'restricted' | 'pending'

interface Props {
    open: boolean
    kind: PendingDialogKind
    feature?: BillingRestrictedFeature
    payment: ICurrentPayment
    onUpload: () => void
    onOpenChange: (open: boolean) => void
}

const COPY: Record<PendingDialogKind, { title: string, icon: React.ReactNode }> = {
    reminder: { title: 'Tienes un pago pendiente', icon: <AlertTriangleIcon aria-hidden /> },
    restricted: { title: 'Sección bloqueada por falta de pago', icon: <LockIcon aria-hidden /> },
    pending: { title: 'Pago pendiente', icon: <AlertTriangleIcon aria-hidden /> },
}

/** El aviso de pago pendiente: un solo modal para el recordatorio y para las funciones cerradas. */
const PaymentPendingDialog = ({ open, kind, feature, payment, onUpload, onOpenChange }: Props) => {
    const navigate = useNavigate()
    const { enforcement } = payment
    const copy = COPY[kind]

    const dueDate = payment.due_date
        ? formatDate(payment.due_date, { formatter: { date: 'medium' }, dateOnly: true })
        : null

    const goToBilling = () => {
        onOpenChange(false)
        navigate(PROFILE_BILLING_PATH)
    }

    return (
        <Modal
            open={open}
            onOpenChange={onOpenChange}
            size="sm"
            title={copy.title}
            footer={
                <>
                    <button
                        type="button"
                        onClick={goToBilling}
                        className="cursor-pointer px-2 text-[12.5px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
                    >
                        Ver mi facturación
                    </button>
                    {payment.can_upload_receipt && (
                        <Button text="Subir comprobante" className="py-2.5 text-sm" onClick={onUpload} />
                    )}
                </>
            }
        >
            <div className="flex flex-col items-center gap-3 py-2 text-center">
                <span className="grid size-12 place-content-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400 [&>svg]:size-6">
                    {copy.icon}
                </span>

                <div>
                    <p className="text-2xl font-extrabold tracking-tight">
                        {formatCurrency(payment.remaining, payment.currency)}
                    </p>
                    <p className="text-[12.5px] font-semibold text-muted-foreground">
                        {periodLabel(payment.period)}
                        {dueDate && ` · venció el ${dueDate}`}
                    </p>
                </div>

                <p className="text-[13px] leading-relaxed text-muted-foreground">
                    {kind === 'restricted' && feature
                        ? <>Para volver a ver <strong className="text-foreground">{RESTRICTED_FEATURE_LABELS[feature]}</strong> necesitas ponerte al día con tu pago.</>
                        : <>Llevas <strong className="text-foreground">{daysLabel(enforcement.days_overdue)}</strong> de atraso. Ponte al día para seguir disfrutando de todo tu plan.</>}
                </p>

                {enforcement.days_until_block !== null && (
                    <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-[12.5px] font-bold text-red-700 dark:bg-red-500/15 dark:text-red-400">
                        Tu cuenta se bloqueará en {daysLabel(enforcement.days_until_block)}
                    </p>
                )}
            </div>
        </Modal>
    )
}

export default PaymentPendingDialog
