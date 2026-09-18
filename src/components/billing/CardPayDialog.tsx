import { useEffect, useState } from 'react'
import { CheckIcon } from 'lucide-react'

import Button from '@/components/common/Button'
import Modal from '@/components/common/Modal'
import { IBillingDebt } from '@/interfaces/billing'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/utils'
import useCardCheckout from './useCardCheckout'
import { PAYMENT_STATUS_UI, periodLabel } from './utils'

interface Props {
    open: boolean
    debt: IBillingDebt
    onOpenChange: (open: boolean) => void
}

/**
 * "Pagar con tarjeta": elige hasta qué mes paga (siempre desde el más viejo), ve el total y sale a la página
 * segura de Stripe. Al volver, el estado de cuenta se pone al día solo.
 */
const CardPayDialog = ({ open, debt, onOpenChange }: Props) => {
    const { start, starting, checkout, error, reopen, refreshBilling, reset } = useCardCheckout()
    // Cuántos meses paga, contando desde el más viejo. Por defecto, todo.
    const [count, setCount] = useState(debt.periods.length)

    useEffect(() => {
        if (open) { setCount(debt.periods.length); reset() }
        // Sólo al abrir: `reset` cambia de identidad en cada render
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open])

    const selected = debt.periods.slice(0, count)
    const total = selected.reduce((sum, item) => sum + item.remaining, 0)
    const settled = !!checkout && debt.periods.length === 0

    return (
        <Modal
            open={open}
            onOpenChange={onOpenChange}
            size="md"
            title="Pagar con tarjeta"
            description={settled
                ? 'Pago recibido'
                : checkout
                    ? 'Abrimos la página de pago en otra pestaña. Cuando termines, vuelve aquí: tu estado de cuenta se actualiza solo.'
                    : debt.periods.length > 1 ? 'Elige hasta qué mes pagas. Siempre se paga primero lo más antiguo.' : 'Esto es lo que tienes por pagar.'}
            footer={settled ? (
                <Button text="Cerrar" className="py-2.5 text-sm" onClick={() => onOpenChange(false)} />
            ) : checkout ? (
                <>
                    <button type="button" onClick={reopen} className="cursor-pointer px-2 text-[12.5px] font-semibold text-muted-foreground transition-colors hover:text-foreground">
                        Volver a abrir la página de pago
                    </button>
                    <Button text="Ya pagué · actualizar" className="py-2.5 text-sm" onClick={refreshBilling} />
                </>
            ) : (
                <>
                    <button type="button" disabled={starting} onClick={() => onOpenChange(false)} className="cursor-pointer px-2 text-[12.5px] font-semibold text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50">
                        Cancelar
                    </button>
                    <Button
                        text={starting ? 'Abriendo el pago…' : `Pagar ${formatCurrency(total, debt.currency)}`}
                        className="py-2.5 text-sm"
                        loading={starting}
                        disabled={starting || total <= 0}
                        onClick={() => start(selected.map(item => item.period))}
                    />
                </>
            )}
        >
            {settled ? (
                <p className="rounded-xl bg-emerald-50 px-3.5 py-3 text-[12.5px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                    Tu cuenta ya está al corriente. ¡Gracias!
                </p>
            ) : checkout ? (
                <div className="flex flex-col gap-2">
                    <div className="rounded-xl border bg-card px-3.5 py-3">
                        <p className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">Total a pagar</p>
                        <p className="text-2xl font-extrabold tracking-tight text-primary">{formatCurrency(checkout.amount, checkout.currency)}</p>
                        <p className="text-[11.5px] font-semibold text-muted-foreground">{checkout.periods.map(item => periodLabel(item.period)).join(' · ')}</p>
                    </div>
                    <p className="text-[11.5px] text-muted-foreground">La liga vence en 30 minutos. Si no terminas, no se hace ningún cargo.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    <ul className="divide-y overflow-hidden rounded-xl border">
                        {debt.periods.map((item, i) => {
                            const on = i < count
                            return (
                                <li key={item.period}>
                                    <button
                                        type="button"
                                        disabled={debt.periods.length === 1}
                                        aria-pressed={on}
                                        onClick={() => setCount(i + 1)}
                                        className={cn('flex w-full cursor-pointer items-center gap-3 px-3.5 py-3 text-left transition-opacity disabled:cursor-default', !on && 'opacity-45')}
                                    >
                                        <span className={cn('grid size-5 shrink-0 place-content-center rounded-full border [&>svg]:size-3', on ? 'border-primary bg-primary text-primary-foreground' : 'text-transparent')}>
                                            <CheckIcon aria-hidden />
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block text-[13px] font-bold tracking-tight">{periodLabel(item.period)}</span>
                                            {item.status && <span className="block text-[11px] font-semibold text-muted-foreground">{PAYMENT_STATUS_UI[item.status]?.label}</span>}
                                        </span>
                                        <span className="text-[13px] font-extrabold tabular-nums">{formatCurrency(item.remaining, debt.currency)}</span>
                                    </button>
                                </li>
                            )
                        })}
                    </ul>

                    <div className="flex items-baseline justify-between rounded-xl bg-primary/[0.06] px-3.5 py-3">
                        <span className="text-[12.5px] font-bold">Total</span>
                        <span className="text-xl font-extrabold tracking-tight text-primary">{formatCurrency(total, debt.currency)}</span>
                    </div>

                    {error && <p role="alert" className="rounded-xl bg-red-50 px-3.5 py-2.5 text-[12.5px] font-semibold text-red-700 dark:bg-red-500/10 dark:text-red-400">{error}</p>}

                    <p className="text-[11.5px] text-muted-foreground">Pagas en una página segura de Stripe. Eyplease+ no ve ni guarda los datos de tu tarjeta.</p>
                </div>
            )}
        </Modal>
    )
}

export default CardPayDialog
