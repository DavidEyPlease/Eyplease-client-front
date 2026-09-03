import { LockIcon, LogOutIcon, UploadCloudIcon } from 'lucide-react'

import Button from '@/components/common/Button'
import useAuth from '@/hooks/useAuth'
import { IBillingPaymentMethod, ICurrentPayment } from '@/interfaces/billing'
import { formatCurrency } from '@/utils'
import PaymentAccounts from '../PaymentAccounts'
import { periodLabel } from '../utils'

interface Props {
    /** Puede faltar si el 403 llegó antes que el overview: se pinta sin importe. */
    payment: ICurrentPayment | null
    paymentMethod?: IBillingPaymentMethod
    onUpload: () => void
}

/**
 * Muro del último día de la escalada: tapa toda la app y solo deja pagar o
 * salir. La API ya responde 403 a todo lo demás, así que esto es la cara de
 * ese bloqueo, no el bloqueo en sí.
 */
const AccountBlockedWall = ({ payment, paymentMethod, onUpload }: Props) => {
    const { handleLogout } = useAuth()

    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-background/95 p-6 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl border bg-card p-8 text-center shadow-card">
                <span className="mx-auto grid size-14 place-content-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400 [&>svg]:size-7">
                    <LockIcon aria-hidden />
                </span>

                <h2 className="mt-4 text-xl font-extrabold tracking-tight">Tu cuenta está bloqueada</h2>
                <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                    {payment
                        ? <>No hemos recibido el pago de <strong className="text-foreground">{periodLabel(payment.period)}</strong>.</>
                        : 'No hemos recibido tu pago.'}
                    {' '}En cuanto lo confirmemos recuperas el acceso a todo tu plan.
                </p>

                {payment && (
                    <p className="mt-5 text-3xl font-extrabold tracking-tight">
                        {formatCurrency(payment.remaining, payment.currency)}
                    </p>
                )}

                {paymentMethod?.type === 'manual' && (
                    <div className="mt-5 text-left">
                        <h4 className="mb-2 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">Paga a</h4>
                        <PaymentAccounts accounts={paymentMethod.accounts} instructions={paymentMethod.instructions} />
                    </div>
                )}

                <div className="mt-6 flex flex-col gap-3">
                    {payment?.can_upload_receipt && (
                        <Button
                            block
                            text={<span className="flex items-center gap-1.5"><UploadCloudIcon className="size-4" aria-hidden />Subir comprobante</span>}
                            className="justify-center py-3 text-sm"
                            onClick={onUpload}
                        />
                    )}
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="flex cursor-pointer items-center justify-center gap-1.5 text-[12.5px] font-semibold text-muted-foreground transition-colors hover:text-foreground [&>svg]:size-4"
                    >
                        <LogOutIcon aria-hidden />
                        Cerrar sesión
                    </button>
                </div>
            </div>
        </div>
    )
}

export default AccountBlockedWall
