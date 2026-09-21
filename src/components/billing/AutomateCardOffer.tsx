import { CreditCardIcon, Loader2Icon, LockIcon } from 'lucide-react'

import { ICardAutomation } from '@/interfaces/billing'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/utils'
import useCardAutomation from './useCardAutomation'

/** «16 de octubre» — la fecha del primer cobro como se dice en voz alta */
const longDate = (ymd: string) => new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'long', timeZone: 'UTC' })
    .format(new Date(`${ymd}T12:00:00Z`))

interface Props {
    automation: ICardAutomation
    /** «Ahora no»: en el diálogo del comprobante cierra; en la ficha no se enseña */
    onDismiss?: () => void
    className?: string
}

/**
 * La invitación a domiciliar la tarjeta. Sale justo al reportar una transferencia —cuando pagar a mano
 * acaba de costarle trabajo— y, mientras le aplique, en su ficha de pagos.
 *
 * Dice lo que más importa antes de pedir nada: que hoy no se le cobra, cuándo será el primer cobro y
 * por cuánto. La tarjeta se teclea en la página de Stripe, no aquí.
 */
const AutomateCardOffer = ({ automation, onDismiss, className }: Props) => {
    const { start, starting } = useCardAutomation()

    if (!automation.available || !automation.first_charge_date) return null

    return (
        <section className={cn('rounded-2xl border border-primary/20 bg-primary/[.05] p-4', className)}>
            <div className="flex gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <CreditCardIcon className="size-5" />
                </span>
                <div className="min-w-0">
                    <b className="block text-[14.5px] font-extrabold tracking-tight">¿Y si el próximo mes se paga solo?</b>
                    <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                        Domicilia tu tarjeta y ya no tendrás que transferir ni mandar comprobantes. Hoy no se te cobra
                        nada: tu primer cobro automático será el <b className="font-semibold text-foreground">{longDate(automation.first_charge_date)}</b>
                        {automation.amount ? <> por <b className="font-semibold text-foreground">{formatCurrency(automation.amount, automation.currency)}</b></> : null}.
                    </p>
                </div>
            </div>

            <div className="mt-3.5 flex flex-wrap items-center gap-2">
                <button
                    type="button"
                    onClick={start}
                    disabled={starting}
                    className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 text-[13px] font-bold text-white transition-opacity disabled:opacity-60"
                >
                    {starting ? <Loader2Icon className="size-4 animate-spin" /> : <CreditCardIcon className="size-4" />}
                    {starting ? 'Abriendo…' : 'Domiciliar mi tarjeta'}
                </button>
                {onDismiss && (
                    <button type="button" onClick={onDismiss} disabled={starting} className="h-10 cursor-pointer rounded-xl px-3 text-[13px] font-bold text-muted-foreground transition-colors hover:text-foreground">
                        Ahora no
                    </button>
                )}
            </div>

            <p className="mt-2.5 flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
                <LockIcon className="size-3.5 shrink-0" /> Tu tarjeta se guarda en la página segura de Stripe, no en Eyplease+.
            </p>
        </section>
    )
}

export default AutomateCardOffer
