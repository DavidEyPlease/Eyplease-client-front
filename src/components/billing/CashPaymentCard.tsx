import { useState } from 'react'
import { CheckCircle2Icon, ClockIcon, CopyIcon, ExternalLinkIcon, LandmarkIcon, LoaderCircleIcon, StoreIcon, XCircleIcon } from 'lucide-react'
import { toast } from 'sonner'

import { API_ROUTES } from '@/constants/api'
import { ApiResponse } from '@/interfaces/common'
import { ICashPayment } from '@/interfaces/billing'
import { cn } from '@/lib/utils'
import HttpService from '@/services/http'
import { copyToClipboard } from '@/utils'

const money = (value = 0, currency = 'MXN') => `${value.toLocaleString('es-MX', { style: 'currency', currency, maximumFractionDigits: 2 })} ${currency}`
/** «12345678901234567890» → «1234 5678 9012 3456 7890» (se lee y se dicta mejor) */
const grouped = (text: string) => text.replace(/\s+/g, '').replace(/(.{4})(?=.)/g, '$1 ')

const STATUS: Record<ICashPayment['status'], { label: string, tone: string, Icon: typeof ClockIcon }> = {
    awaiting: { label: 'Esperando tu pago', tone: 'bg-amber-500/15 text-amber-700 dark:text-amber-300', Icon: ClockIcon },
    paid: { label: 'Pagado', tone: 'bg-emerald-500/14 text-emerald-700 dark:text-emerald-300', Icon: CheckCircle2Icon },
    expired: { label: 'Vencida', tone: 'bg-red-500/12 text-red-700 dark:text-red-300', Icon: XCircleIcon },
    canceled: { label: 'Ya no sirve', tone: 'bg-muted text-muted-foreground', Icon: XCircleIcon },
}

const Row = ({ label, value, copy }: { label: string, value: string, copy?: string }) => (
    <div className="flex items-center justify-between gap-3 border-b border-border py-2.5 last:border-b-0">
        <span className="min-w-0">
            <small className="block text-[10.5px] font-bold tracking-wider text-muted-foreground uppercase">{label}</small>
            <b className="block font-mono text-[15px] font-bold tracking-wide break-words">{value}</b>
        </span>
        {copy && (
            <button type="button" onClick={() => copyToClipboard(copy)} aria-label={`Copiar ${label}`} className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-full border border-border text-muted-foreground hover:text-foreground">
                <CopyIcon className="size-4" />
            </button>
        )}
    </div>
)

interface Props {
    payment: ICashPayment
    /** Al refrescar con «Ya pagué» */
    onUpdate: (payment: ICashPayment) => void
    /** Se confirmó el pago */
    onPaid?: (payment: ICashPayment) => void
    /** Debajo de los datos: cuándo se activa o se aplica */
    note?: string
    className?: string
}

/**
 * Una ficha de OXXO o una transferencia SPEI ya pedida, para pagarla: el número o la CLABE con su referencia y el
 * monto (con «copiar»), cuándo vence, la página de Stripe y «Ya pagué», que pregunta a Stripe cómo va.
 */
const CashPaymentCard = ({ payment, onUpdate, onPaid, note, className }: Props) => {
    const [checking, setChecking] = useState(false)
    const status = STATUS[payment.status] ?? STATUS.awaiting
    const oxxo = payment.method === 'oxxo'
    const link = (oxxo ? payment.oxxo?.voucher_url : payment.transfer?.instructions_url) || payment.url
    const remaining = payment.transfer?.amount_remaining ?? payment.amount
    const short = !oxxo && remaining > 0 && remaining < payment.amount

    const check = async () => {
        setChecking(true)
        try {
            const res = await HttpService.get<ApiResponse<ICashPayment>>(API_ROUTES.BILLING.CASH_PAYMENT_ITEM.replace('{id}', payment.id))
            const fresh = res.data
            if (!fresh) return
            onUpdate(fresh)
            if (fresh.status === 'paid') {
                toast.success('¡Recibido! Tu pago quedó confirmado.')
                onPaid?.(fresh)
            } else if (fresh.status === 'awaiting') {
                toast(oxxo ? 'Todavía no nos llega. El pago en OXXO se confirma al día hábil siguiente.' : 'Todavía no nos llega. La transferencia se confirma en minutos: revisa en un rato.')
            }
        } catch (error) {
            toast.error((error as { message?: string })?.message || 'No pudimos revisar tu pago. Inténtalo otra vez.')
        } finally {
            setChecking(false)
        }
    }

    return (
        <section className={cn('rounded-3xl border bg-card px-5 py-4 shadow-card', className)}>
            <div className="flex flex-wrap items-center gap-3">
                <span className={cn('grid size-11 shrink-0 place-items-center rounded-2xl text-white', oxxo ? 'bg-[linear-gradient(135deg,#E5484D,#F5B544)]' : 'bg-[linear-gradient(135deg,#4E31C0,#2CD4D9)]')}>
                    {oxxo ? <StoreIcon className="size-5" /> : <LandmarkIcon className="size-5" />}
                </span>
                <span className="min-w-0 flex-1">
                    <b className="block text-[16px] leading-tight font-extrabold">{oxxo ? 'Paga en OXXO' : 'Transferencia SPEI'}</b>
                    <small className="block text-[12.5px] text-muted-foreground">{short ? <>Te falta transferir <b className="text-foreground">{money(remaining, payment.currency)}</b> de {money(payment.amount, payment.currency)}</> : money(payment.amount, payment.currency)}</small>
                </span>
                <span className={cn('inline-flex h-[24px] items-center gap-1.5 rounded-full px-2.5 text-[11px] font-bold', status.tone)}>
                    <status.Icon className="size-3.5" /> {status.label}
                </span>
            </div>

            {payment.status === 'awaiting' && (
                <>
                    <div className="mt-3 rounded-2xl bg-muted/50 px-3.5 py-1">
                        {oxxo && payment.oxxo ? (
                            <>
                                <Row label="Número de referencia" value={grouped(payment.oxxo.number)} copy={payment.oxxo.number} />
                                <Row label="Monto exacto" value={money(payment.amount, payment.currency)} />
                            </>
                        ) : payment.transfer ? (
                            <>
                                <Row label="CLABE" value={grouped(payment.transfer.clabe)} copy={payment.transfer.clabe} />
                                <Row label="Banco" value={payment.transfer.bank} />
                                {payment.transfer.reference && <Row label="Referencia" value={payment.transfer.reference} copy={payment.transfer.reference} />}
                                <Row label="Monto" value={money(remaining, payment.currency)} copy={String(remaining)} />
                            </>
                        ) : null}
                    </div>
                    <p className="mt-2.5 text-[12.5px] leading-snug text-muted-foreground">
                        {oxxo
                            ? <>Dile en caja que es un pago de <b className="text-foreground">OXXO Pay</b>, dicta el número y paga en efectivo{payment.oxxo?.expires_label ? <> antes del <b className="text-foreground">{payment.oxxo.expires_label}</b></> : null}. Guarda tu ticket.</>
                            : <>Desde la app de tu banco, transfiere a esta CLABE el monto exacto. Se acredita sola en minutos.</>}
                        {note ? <> {note}</> : null}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                        <a href={link} target="_blank" rel="noopener" className="inline-flex h-10 items-center gap-2 rounded-full border border-border px-4 text-[13px] font-semibold hover:border-[#6C47FF]/40">
                            <ExternalLinkIcon className="size-4" /> {oxxo ? 'Ver mi ficha' : 'Ver datos completos'}
                        </a>
                        <button type="button" onClick={check} disabled={checking} className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full bg-primary-gradient px-5 text-[13px] font-bold text-white shadow-primary-glow disabled:opacity-70">
                            {checking && <LoaderCircleIcon className="size-4 animate-spin" />} Ya pagué
                        </button>
                    </div>
                </>
            )}

            {payment.status === 'paid' && <p className="mt-3 text-[13px] font-semibold text-emerald-700 dark:text-emerald-300">¡Recibido! Tu pago quedó confirmado.</p>}
            {(payment.status === 'expired' || payment.status === 'canceled') && <p className="mt-3 text-[13px] text-muted-foreground">Esta ficha ya no sirve. Si todavía no pagas, pide una nueva.</p>}
        </section>
    )
}

export default CashPaymentCard
