import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { CheckIcon, CopyIcon, LandmarkIcon, StoreIcon } from 'lucide-react'

import Button from '@/components/common/Button'
import Modal from '@/components/common/Modal'
import { API_ROUTES } from '@/constants/api'
import { IBillingDebt, IBillingOverview, ICashOptions, ICashPayment } from '@/interfaces/billing'
import { ApiResponse } from '@/interfaces/common'
import { cn } from '@/lib/utils'
import HttpService from '@/services/http'
import { copyToClipboard, formatCurrency } from '@/utils'
import CashPaymentCard from './CashPaymentCard'
import { PAYMENT_STATUS_UI, billingOverviewKey, billingPaymentsKey, periodLabel, periodsLabel } from './utils'

type Method = 'oxxo' | 'transfer'
const METHODS: Array<{ key: Method, label: string, hint: string, Icon: typeof StoreIcon, action: string }> = [
    { key: 'oxxo', label: 'OXXO', hint: 'En efectivo, en cualquier OXXO. Se confirma al día hábil siguiente.', Icon: StoreIcon, action: 'Generar mi ficha' },
    { key: 'transfer', label: 'Transferencia', hint: 'Desde la app de tu banco. Se confirma en minutos.', Icon: LandmarkIcon, action: 'Ver los datos para transferir' },
]
const grouped = (text: string) => text.replace(/\s+/g, '').replace(/(.{4})(?=.)/g, '$1 ')

/** ¿Se le ofrece pagar en OXXO o por transferencia? Lo decide la API (cobro manual, MXN y su interruptor) */
const cashOptions = (overview?: IBillingOverview): ICashOptions | null => {
    const method = overview?.payment_method
    return method?.type === 'manual' && method.cash?.available ? method.cash : null
}

interface DialogProps {
    open: boolean
    debt: IBillingDebt
    cash: ICashOptions
    onOpenChange: (open: boolean) => void
    onCreated: (payment: ICashPayment) => void
}

/** «Pagar»: OXXO o transferencia, hasta qué mes (siempre desde el más viejo) y el total; la API arma la ficha */
const CashPayDialog = ({ open, debt, cash, onOpenChange, onCreated }: DialogProps) => {
    const firstMethod: Method = cash.methods.oxxo && !cash.oxxo_needs_email ? 'oxxo' : 'transfer'
    const [method, setMethod] = useState<Method>(firstMethod)
    const [count, setCount] = useState(debt.periods.length)
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (open) { setCount(debt.periods.length); setMethod(firstMethod); setError('') }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open])

    const selected = debt.periods.slice(0, count)
    const total = selected.reduce((sum, item) => sum + item.remaining, 0)
    const current = METHODS.find(item => item.key === method) ?? METHODS[0]

    const create = async () => {
        setBusy(true)
        setError('')
        try {
            const res = await HttpService.post<ApiResponse<ICashPayment>>(API_ROUTES.BILLING.CASH_PAYMENT, {
                method,
                // Todo lo que debe no hace falta mandarlo: la API lo toma del más viejo
                ...(count < debt.periods.length ? { periods: selected.map(item => item.period) } : {}),
            })
            if (!res.data) throw new Error('Sin datos de pago')
            onCreated(res.data)
            onOpenChange(false)
        } catch (err) {
            setError((err as { message?: string })?.message || 'No pudimos preparar tu pago. Inténtalo otra vez.')
        } finally {
            setBusy(false)
        }
    }

    return (
        <Modal
            open={open}
            onOpenChange={value => { if (!busy) onOpenChange(value) }}
            size="md"
            title="Pagar en OXXO o por transferencia"
            description={debt.periods.length > 1 ? 'Elige cómo y hasta qué mes pagas. Siempre se paga primero lo más antiguo.' : 'Elige cómo pagas. Se acredita solo, sin mandar comprobante.'}
            footer={(
                <>
                    <button type="button" disabled={busy} onClick={() => onOpenChange(false)} className="cursor-pointer px-2 text-[12.5px] font-semibold text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50">
                        Cancelar
                    </button>
                    <Button text={busy ? 'Preparando…' : current.action} className="py-2.5 text-sm" loading={busy} disabled={busy || total <= 0} onClick={create} />
                </>
            )}
        >
            <div className="flex flex-col gap-3">
                <div className="grid gap-2 sm:grid-cols-2">
                    {METHODS.filter(item => cash.methods[item.key]).map(item => {
                        const noEmail = item.key === 'oxxo' && cash.oxxo_needs_email
                        const on = method === item.key
                        return (
                            <button
                                key={item.key}
                                type="button"
                                disabled={noEmail}
                                aria-pressed={on}
                                onClick={() => setMethod(item.key)}
                                className={cn('flex cursor-pointer items-start gap-2.5 rounded-xl border-[1.5px] px-3.5 py-3 text-left transition-colors disabled:cursor-default disabled:opacity-55', on ? 'border-primary bg-primary/[0.06]' : 'hover:border-primary/40')}
                            >
                                <item.Icon className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
                                <span className="min-w-0">
                                    <span className="block text-[13.5px] font-bold">{item.label}</span>
                                    <span className="block text-[11.5px] leading-snug font-semibold text-muted-foreground">{noEmail ? 'Agrega tu correo en Datos personales para pagar en OXXO.' : item.hint}</span>
                                </span>
                            </button>
                        )
                    })}
                </div>

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

                <p className="text-[11.5px] text-muted-foreground">Con OXXO o transferencia pagas tú cada mes (no se cobra solo). El pago lo procesa Stripe y se aplica a tu cuenta en cuanto se confirma.</p>
            </div>
        </Modal>
    )
}

/**
 * Pagar sus meses en OXXO o por transferencia SPEI (Stripe), para quien paga a mano: el botón «Pagar», la ficha o
 * transferencia que dejó abierta con «Ya pagué», y su CLABE propia (la misma siempre) en cuanto la tiene. Lo enciende
 * la API (`payment_method.cash`); sin eso no se pinta.
 */
const CashPayPanel = ({ overview }: { overview?: IBillingOverview }) => {
    const queryClient = useQueryClient()
    const cash = cashOptions(overview)
    const [payment, setPayment] = useState<ICashPayment | null>(null)
    const [open, setOpen] = useState(false)

    const fromApi = cash?.pending ?? null
    useEffect(() => { setPayment(fromApi) }, [fromApi])

    if (!cash || !overview) return null

    const debt = overview.debt
    const owes = debt.total > 0 && debt.periods.length > 0
    const awaiting = payment?.status === 'awaiting' ? payment : null
    if (!owes && !awaiting && !cash.clabe) return null

    const refresh = () => {
        queryClient.invalidateQueries({ queryKey: billingOverviewKey })
        queryClient.invalidateQueries({ queryKey: billingPaymentsKey })
    }
    const applied = awaiting?.periods.length ? `Se aplica a ${periodsLabel(awaiting.periods.map(item => item.period))} en cuanto se confirme.` : 'Se aplica a tu cuenta en cuanto se confirme.'

    return (
        <section className="flex flex-col gap-3 rounded-2xl border border-primary/30 bg-primary/[0.05] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <h4 className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-primary uppercase [&>svg]:size-3.5">
                        <StoreIcon aria-hidden />
                        Paga en OXXO o por transferencia
                    </h4>
                    <p className="mt-1 text-[12.5px] font-semibold text-muted-foreground">
                        {awaiting
                            ? 'Tienes un pago abierto: aquí están sus datos.'
                            : owes
                                ? <>Tienes {formatCurrency(debt.total, debt.currency)} por pagar. Se acredita solo, sin mandar comprobante.</>
                                : 'Estás al día. Cuando toque tu mensualidad, págala aquí.'}
                    </p>
                </div>
                {owes && !awaiting && <Button text="Pagar" className="py-2.5 text-sm" onClick={() => setOpen(true)} />}
            </div>

            {awaiting && (
                <>
                    <CashPaymentCard payment={awaiting} onUpdate={setPayment} onPaid={refresh} note={applied} className="shadow-none" />
                    {owes && (
                        <button type="button" onClick={() => setOpen(true)} className="cursor-pointer self-center text-[12.5px] font-semibold text-muted-foreground hover:text-foreground">
                            Pagar de otra forma (usa sólo la nueva)
                        </button>
                    )}
                </>
            )}

            {cash.clabe && (
                <div className="flex items-center justify-between gap-3 rounded-xl border bg-card px-3.5 py-3">
                    <span className="min-w-0">
                        <small className="block text-[10.5px] font-bold tracking-wider text-muted-foreground uppercase">Tu CLABE para pagar Eyplease+ · {cash.clabe.bank}</small>
                        <b className="block font-mono text-[15px] font-bold tracking-wide break-words">{grouped(cash.clabe.clabe)}</b>
                        <small className="block text-[11.5px] font-semibold text-muted-foreground">Es la misma siempre. Transfiere tu mensualidad y se acredita sola.</small>
                    </span>
                    <button type="button" onClick={() => cash.clabe && copyToClipboard(cash.clabe.clabe)} aria-label="Copiar tu CLABE" className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-full border text-muted-foreground hover:text-foreground">
                        <CopyIcon className="size-4" />
                    </button>
                </div>
            )}

            {owes && (
                <CashPayDialog
                    open={open}
                    debt={debt}
                    cash={cash}
                    onOpenChange={setOpen}
                    onCreated={created => { setPayment(created); refresh() }}
                />
            )}
        </section>
    )
}

export default CashPayPanel
