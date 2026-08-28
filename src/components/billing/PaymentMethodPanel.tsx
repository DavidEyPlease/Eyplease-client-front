import { AlertTriangleIcon, CreditCardIcon, LandmarkIcon } from 'lucide-react'

import StatTile from '@/components/generics/StatTile'
import { Skeleton } from '@/components/ui/skeleton'
import { IBillingOverview } from '@/interfaces/billing'
import { formatCurrency } from '@/utils'
import { formatDate } from '@/utils/dates'
import PaymentAccounts from './PaymentAccounts'
import { periodLabel } from './utils'

interface Props {
    overview?: IBillingOverview
    loading: boolean
}

/** Cómo y cuándo paga el cliente: tipo de cobro, medio guardado e importes. */
const PaymentMethodPanel = ({ overview, loading }: Props) => {
    if (loading) {
        return (
            <div className="flex flex-col gap-3">
                <Skeleton className="h-20 rounded-2xl" />
                <Skeleton className="h-24 rounded-2xl" />
            </div>
        )
    }

    if (!overview) return null

    const { payment_method: paymentMethod } = overview
    const isAutomatic = paymentMethod.type === 'automatic'
    const nextChargeDate = overview.next_charge_date
        ? formatDate(overview.next_charge_date, { formatter: { date: 'medium' }, dateOnly: true })
        : null

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2.5">
                <StatTile
                    label="Próximo pago"
                    value={formatCurrency(overview.next_amount, overview.currency)}
                    hint={nextChargeDate ? `El ${nextChargeDate}` : 'Sin fecha asignada'}
                />
                <StatTile
                    label="Saldo pendiente"
                    value={formatCurrency(overview.balance, overview.currency)}
                    tone={overview.balance > 0 ? 'danger' : 'success'}
                    hint={overview.current_payment
                        ? `Desde ${periodLabel(overview.current_payment.period)}`
                        : 'Estás al día'}
                />
                <StatTile
                    label="Cobro"
                    value={isAutomatic ? 'Automático' : 'Manual'}
                    tone="cyan"
                    hint={overview.payment_day ? `Cada día ${overview.payment_day}` : 'Sin día de pago'}
                />
            </div>

            <section className="rounded-2xl border bg-card p-4">
                <h4 className="mb-2.5 flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-muted-foreground uppercase [&>svg]:size-3.5">
                    {isAutomatic ? <CreditCardIcon aria-hidden /> : <LandmarkIcon aria-hidden />}
                    {isAutomatic ? 'Tu tarjeta' : 'Dónde pagar'}
                </h4>

                {paymentMethod.type === 'automatic' ? (
                    paymentMethod.card ? (
                        <div>
                            <p className="text-[15px] font-extrabold tracking-tight">
                                ···· ···· ···· {paymentMethod.card.last_four}
                            </p>
                            <p className="mt-0.5 text-[11.5px] font-semibold text-muted-foreground capitalize">
                                {paymentMethod.card.brand ?? 'Tarjeta'} · se cobra sola cada periodo
                            </p>
                        </div>
                    ) : (
                        <p className="flex items-start gap-2 rounded-xl bg-amber-50 px-3.5 py-3 text-[12.5px] font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 [&>svg]:mt-0.5 [&>svg]:size-4 [&>svg]:shrink-0">
                            <AlertTriangleIcon aria-hidden />
                            No tenemos una tarjeta registrada. Escríbenos para actualizarla y que el cobro no falle.
                        </p>
                    )
                ) : (
                    <PaymentAccounts accounts={paymentMethod.accounts} instructions={paymentMethod.instructions} />
                )}
            </section>
        </div>
    )
}

export default PaymentMethodPanel
