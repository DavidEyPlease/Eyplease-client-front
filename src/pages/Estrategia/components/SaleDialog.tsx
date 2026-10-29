import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Loader2Icon } from 'lucide-react'
import { toast } from 'sonner'

import { API_ROUTES } from '@/constants/api'
import { ApiResponse, PaginationResponse } from '@/interfaces/common'
import { CustomerOfClient } from '@/interfaces/customerOfClients'
import { CustomerSale, InventoryItem, NewSalePayload } from '@/interfaces/inventory'
import useInventory, { useSaleActions } from '@/hooks/useInventory'
import { cn } from '@/lib/utils'
import HttpService from '@/services/http'
import useAuthStore from '@/store/auth'
import { titleCaseName } from '@/pages/Hoy/lib'
import { friendlyError, lineProfit, money, parseAmount, pieces } from '../format'
import Field from './Field'
import HowToDialog from './HowToDialog'
import Panel from './Panel'
import ProductShape from './ProductShape'
import Stepper from './Stepper'

export interface SaleCustomer {
    id: string
    name: string
}

/** Lo que ya trae puesto al abrir: los productos de una pieza de su estrategia, con el precio que puso */
export interface SalePreset {
    note?: string
    lines: Array<{ sku: string, quantity: number, unitPrice: number }>
}

type Who = { kind: 'client', id: string, name: string } | { kind: 'new' } | null

/** Un producto de la venta. Lo de su inventario trae su costo (para decirle cuánto gana) y su tope (lo que le queda). */
interface Line {
    key: string
    sku: string | null
    name: string
    quantity: number
    price: string
    unitCost: number | null
    max: number | null
}

const lineFromItem = (item: InventoryItem, quantity = 1, unitPrice?: number): Line => ({
    key: item.sku, sku: item.sku, name: item.name, quantity: Math.min(quantity, item.on_hand) || 1,
    price: String(unitPrice ?? (item.price || '')), unitCost: item.unit_cost, max: item.on_hand,
})

const plain = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const firstName = (name: string) => titleCaseName(name).split(' ')[0]
const LIMIT_CODE = 'PLAN_LIMIT_CUSTOMERS'
const LABEL = 'mb-2 text-[11px] font-extrabold tracking-wider text-muted-foreground uppercase'

interface Props {
    open: boolean
    onClose: () => void
    /** Llega desde la ficha de una clienta: ya sabemos quién */
    customer?: SaleCustomer | null
    /** Llega desde una pieza de su estrategia: ya sabemos qué y a cuánto */
    preset?: SalePreset | null
}

/**
 * «Ya me compró»: a quién (de Mis Clientas o «+ Otra», que se puede guardar) y qué se llevó de su inventario, con el
 * precio que le cobró por pieza y lo que gana. Al anotarla baja de su inventario y queda en la ficha de su clienta.
 */
const SaleDialog = ({ open, onClose, customer = null, preset = null }: Props) => {
    const { data: inventory, loading: loadingInventory } = useInventory({ enabled: open })
    const { record } = useSaleActions()
    const ready = useAuthStore(state => open && !customer && !!state.user && !state.initialLoading)

    const [who, setWho] = useState<Who>(null)
    const [newName, setNewName] = useState('')
    const [saveNew, setSaveNew] = useState(true)
    const [clientSearch, setClientSearch] = useState('')
    const [lines, setLines] = useState<Line[]>([])
    const [search, setSearch] = useState('')
    const [presetApplied, setPresetApplied] = useState(false)
    // Anotada una venta con productos que tienen su «cómo usarlo»: la confirmación ofrece mandárselo a la clienta
    const [howto, setHowto] = useState<{ sale: CustomerSale, notice: string } | null>(null)

    // Sus clientas de una vez (no la lista paginada de Mis Clientas): para elegir hacen falta todas
    const clientsQuery = useQuery({
        queryKey: ['entity', 'my-clients', 'venta'],
        queryFn: async () => (await HttpService.get<ApiResponse<PaginationResponse<CustomerOfClient>>>(`${API_ROUTES.MY_CLIENTS.LIST}?perPage=100`)).data,
        staleTime: 60_000,
        enabled: ready,
    })
    const clients = useMemo(() => clientsQuery.data?.items ?? [], [clientsQuery.data])

    // Al abrir, de cero; si llega desde su ficha, ya con la clienta
    const customerId = customer?.id ?? null
    const customerName = customer?.name ?? ''
    useEffect(() => {
        if (!open) return
        setWho(customerId ? { kind: 'client', id: customerId, name: customerName } : null)
        setNewName('')
        setSaveNew(true)
        setClientSearch('')
        setLines([])
        setSearch('')
        setPresetApplied(false)
    }, [open, customerId, customerName])

    // Desde una pieza: sus productos con el precio que puso, en cuanto llega el inventario
    useEffect(() => {
        if (!open || presetApplied || !preset || !inventory) return
        const byKey = new Map(inventory.items.map(item => [item.sku, item]))
        setLines(preset.lines.flatMap(line => {
            const item = byKey.get(line.sku)
            return item && item.on_hand > 0 ? [lineFromItem(item, line.quantity, line.unitPrice)] : []
        }))
        setPresetApplied(true)
    }, [open, preset, inventory, presetApplied])

    const shownClients = useMemo(() => {
        const wanted = plain(clientSearch.trim())
        return wanted ? clients.filter(client => plain(client.name).includes(wanted)) : clients
    }, [clients, clientSearch])

    // Lo que puede vender: lo que le queda (en el orden de la API, lo guardado más tiempo primero) y que no eligió ya
    const available = useMemo(() => {
        const chosen = new Set(lines.map(line => line.sku))
        const wanted = plain(search.trim())
        return (inventory?.items ?? [])
            .filter(item => item.on_hand > 0 && !chosen.has(item.sku))
            .filter(item => !wanted || plain(`${item.name} ${item.shade ?? ''}`).includes(wanted))
    }, [inventory, lines, search])
    const inStock = (inventory?.items ?? []).filter(item => item.on_hand > 0).length

    const update = (key: string, change: Partial<Line>) => setLines(current => current.map(line => line.key === key ? { ...line, ...change } : line))
    const removeLine = (key: string) => setLines(current => current.filter(line => line.key !== key))
    const addOther = () => setLines(current => [...current, { key: `otro-${Date.now()}`, sku: null, name: '', quantity: 1, price: '', unitCost: null, max: null }])

    const totals = lines.reduce((acc, line) => {
        const unit = parseAmount(line.price) ?? 0
        const profit = lineProfit(unit, line.unitCost, line.quantity)
        return { total: acc.total + unit * line.quantity, profit: acc.profit + (profit ?? 0), unknown: acc.unknown + (profit === null ? 1 : 0) }
    }, { total: 0, profit: 0, unknown: 0 })

    const whoReady = who?.kind === 'client' || (who?.kind === 'new' && newName.trim().length >= 2)
    const linesReady = lines.length > 0 && lines.every(line => line.name.trim().length >= 2 && line.quantity > 0)
    const missing = !who ? '¿Quién te compró?' : !whoReady ? 'Escribe el nombre de tu clienta' : !lines.length ? 'Elige lo que se llevó' : !linesReady ? 'Falta el nombre de un producto' : null
    const buyerName = who?.kind === 'client' ? who.name : newName.trim()

    const submit = async () => {
        if (!who || missing) return
        const payload: NewSalePayload = {
            ...(who.kind === 'client' ? { client_customer_id: who.id } : { customer_name: newName.trim(), save_customer: saveNew }),
            items: lines.map(line => ({ ...(line.sku ? { sku: line.sku } : {}), name: line.name.trim(), quantity: line.quantity, unit_price: parseAmount(line.price) ?? 0 })),
            source: 'app',
            ...(preset?.note ? { note: preset.note } : {}),
        }
        const fromInventory = lines.some(line => line.sku)
        const done = (inFile: boolean, sale?: CustomerSale | null, text?: string) => {
            const notice = text ?? (inFile
                ? `Listo: anotado en la ficha de ${firstName(buyerName)}${fromInventory ? ' y descontado de tu inventario' : ''}.`
                : `Listo: anotado${fromInventory ? ' y descontado de tu inventario' : ''}.`)
            if (sale?.howto?.slides.length) setHowto({ sale, notice })
            else toast.success(notice)
            onClose()
        }
        const failed = (error: unknown) => toast.error(friendlyError(error, 'No se pudo anotar. Intenta de nuevo.'))
        try {
            const sale = await record.mutateAsync(payload)
            done(who.kind === 'client' || !!payload.save_customer, sale)
        } catch (error) {
            // Se llenó su cupo de clientas: la venta se anota igual, sin guardarla en Mis Clientas
            if (!payload.save_customer || (error as { message?: string } | null)?.message !== LIMIT_CODE) {
                failed(error)
                return
            }
            try {
                const sale = await record.mutateAsync({ ...payload, save_customer: false })
                done(false, sale, 'Quedó anotada. No la guardé en Mis Clientas: llegaste al tope de clientas de tu plan.')
            } catch (retryError) {
                failed(retryError)
            }
        }
    }

    const footer = (
        <>
            {lines.length > 0 && (
                <p className="mb-2.5 flex items-baseline justify-between text-[13.5px]">
                    <span>Total <b className="text-[16px] font-extrabold">{money(totals.total)}</b></span>
                    {totals.unknown === lines.length ? (
                        <span className="text-[12px] text-muted-foreground">Sin factura: no sé cuánto ganas</span>
                    ) : (
                        <span className={cn('font-semibold', totals.profit < 0 ? 'text-[#E5484D]' : 'text-emerald-600 dark:text-emerald-300')}>
                            {totals.profit < 0 ? 'Pierdes' : 'Ganas'} <b className="text-[16px] font-extrabold">{money(Math.abs(totals.profit))}</b>
                            {totals.unknown > 0 && <small className="font-medium text-muted-foreground"> + lo sin factura</small>}
                        </span>
                    )}
                </p>
            )}
            <button
                type="button"
                disabled={!!missing || record.isPending}
                onClick={submit}
                className="hoy-cta flex h-12 w-full cursor-pointer items-center justify-center rounded-full text-[14.5px] font-bold text-white disabled:cursor-default disabled:opacity-50"
            >
                {record.isPending ? <Loader2Icon className="size-5 animate-spin" /> : missing ?? `Anotar la venta${buyerName ? ` a ${firstName(buyerName)}` : ''}`}
            </button>
        </>
    )

    return (
        <>
        <Panel open={open} onClose={onClose} title="Ya me compró" description="Lo descuento de tu inventario y lo anoto en su ficha, para que sepas qué te ha comprado." footer={footer}>
            <div className="grid grid-cols-1 gap-5">
                {/* ---------- ¿Quién? ---------- */}
                <section>
                    <p className={LABEL}>¿Quién te compró?</p>
                    {customer ? (
                        <p className="rounded-[14px] border border-border bg-card px-3.5 py-3 text-[14px] font-bold">{titleCaseName(customer.name)}</p>
                    ) : (
                        <>
                            {clients.length > 12 && <Field label="Buscar clienta" value={clientSearch} onChange={setClientSearch} placeholder="Escribe su nombre" className="mb-2" />}
                            {clientsQuery.isLoading ? (
                                <div className="hoy-skel h-9 rounded-full" />
                            ) : (
                                <div className="flex max-h-[150px] flex-wrap gap-2 overflow-y-auto">
                                    {shownClients.map(client => {
                                        const selected = who?.kind === 'client' && who.id === client.id
                                        return (
                                            <button key={client.id} type="button" aria-pressed={selected} onClick={() => setWho({ kind: 'client', id: client.id, name: client.name })}
                                                className={cn('h-9 cursor-pointer rounded-full px-3.5 text-[13px] font-semibold transition-colors', selected ? 'bg-[#4E31C0] text-white' : 'border border-border bg-card hover:border-[#6C47FF]/40')}>
                                                {titleCaseName(client.name).split(' ').slice(0, 2).join(' ')}
                                            </button>
                                        )
                                    })}
                                    <button type="button" aria-pressed={who?.kind === 'new'} onClick={() => setWho({ kind: 'new' })}
                                        className={cn('h-9 cursor-pointer rounded-full px-3.5 text-[13px] font-semibold', who?.kind === 'new' ? 'bg-[#4E31C0] text-white' : 'border border-dashed border-[#6C47FF]/45 text-[#4E31C0] dark:text-[#BBAAFF]')}>
                                        + Otra
                                    </button>
                                </div>
                            )}
                            {who?.kind === 'new' && (
                                <div className="mt-2.5 grid gap-2">
                                    <Field label="¿Cómo se llama?" value={newName} onChange={setNewName} placeholder="Nombre de tu clienta" autoFocus />
                                    <label className="flex cursor-pointer items-center gap-2.5 px-1 text-[13px] font-semibold">
                                        <input type="checkbox" checked={saveNew} onChange={event => setSaveNew(event.target.checked)} className="size-[18px] accent-[#4E31C0]" />
                                        Guardarla en Mis Clientas
                                    </label>
                                </div>
                            )}
                        </>
                    )}
                </section>

                {/* ---------- ¿Qué se llevó? ---------- */}
                <section>
                    <p className={LABEL}>¿Qué se llevó?</p>
                    {lines.length > 0 && (
                        <div className="mb-3 grid gap-2">
                            {lines.map(line => {
                                const profit = lineProfit(parseAmount(line.price) ?? 0, line.unitCost, line.quantity)
                                return (
                                    <div key={line.key} className="rounded-[18px] border border-border bg-card p-3">
                                        <div className="flex items-start gap-3">
                                            <ProductShape name={line.name || 'producto'} className="size-9" />
                                            <span className="min-w-0 flex-1">
                                                {line.sku ? (
                                                    <b className="block text-[13.5px] leading-snug font-bold">{line.name}</b>
                                                ) : (
                                                    <input value={line.name} onChange={event => update(line.key, { name: event.target.value })} placeholder="¿Qué producto?" aria-label="Nombre del producto" autoFocus
                                                        className="w-full border-0 border-b border-border bg-transparent p-0 pb-1 text-[13.5px] font-bold outline-none placeholder:font-medium placeholder:text-muted-foreground/60" />
                                                )}
                                                {line.max !== null && <small className="block text-[11.5px] text-muted-foreground">te quedan {pieces(line.max)}</small>}
                                            </span>
                                            <button type="button" onClick={() => removeLine(line.key)} className="cursor-pointer text-[12px] font-semibold text-muted-foreground hover:text-foreground">Quitar</button>
                                        </div>
                                        <div className="mt-2.5 flex items-end gap-3">
                                            <Field label="Precio por pieza" value={line.price} onChange={value => update(line.key, { price: value })} inputMode="decimal" prefix="$" placeholder="0" className="w-[140px] shrink-0" />
                                            <Stepper value={line.quantity} min={1} max={line.max} onChange={quantity => update(line.key, { quantity })} label={line.name || 'producto'} className="pb-1.5" />
                                        </div>
                                        <p className={cn('mt-2 text-[12.5px] font-semibold', profit !== null && profit < 0 ? 'text-[#E5484D]' : 'text-emerald-600 dark:text-emerald-300')}>
                                            {profit === null
                                                ? <span className="font-medium text-muted-foreground">Sin factura de este producto: no sé cuánto te costó.</span>
                                                : profit < 0 ? <>Pierdes <b>{money(-profit)}</b> con ese precio.</>
                                                    : <>Ganas <b>{money(profit)}</b>{line.quantity > 1 ? ` (${money(profit / line.quantity)} por pieza)` : ''}.</>}
                                        </p>
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    <div className="rounded-[18px] border border-border bg-card px-3 py-1">
                        {loadingInventory ? (
                            <div className="hoy-skel my-2 h-12 rounded-xl" />
                        ) : (
                            <>
                                {inStock > 6 && <Field label="Buscar en tu inventario" value={search} onChange={setSearch} placeholder="CC Cream, perfume…" className="my-2" />}
                                {available.map(item => (
                                    <button key={item.sku} type="button" onClick={() => { setLines(current => [...current, lineFromItem(item)]); setSearch('') }}
                                        className="flex w-full cursor-pointer items-center gap-3 border-b border-border py-2 text-left last:border-b-0 hover:opacity-90">
                                        <ProductShape name={item.name} className="size-9" />
                                        <span className="min-w-0 flex-1">
                                            <b className="block truncate text-[13.5px] font-semibold">{item.name}</b>
                                            <small className="block text-[11.5px] text-muted-foreground">te quedan {pieces(item.on_hand)}{item.price ? ` · ${money(item.price)}` : ''}{item.stale ? ' · muévelo primero' : ''}</small>
                                        </span>
                                        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#6C47FF]/10 text-lg leading-none font-bold text-[#4E31C0] dark:text-[#BBAAFF]" aria-hidden>+</span>
                                    </button>
                                ))}
                                {!available.length && (
                                    <p className="py-3 text-center text-[12.5px] text-muted-foreground">{search ? 'No está en tu inventario.' : inStock ? 'Ya elegiste todo lo que tienes.' : 'Tu inventario está vacío.'}</p>
                                )}
                                <button type="button" onClick={addOther} className="my-2 w-full cursor-pointer rounded-full border border-dashed border-[#6C47FF]/45 py-2.5 text-[12.5px] font-semibold text-[#4E31C0] dark:text-[#BBAAFF]">
                                    + Algo que no está en tu inventario
                                </button>
                            </>
                        )}
                    </div>
                </section>
            </div>
        </Panel>
        <HowToDialog sale={howto?.sale ?? null} notice={howto?.notice} onClose={() => setHowto(null)} />
        </>
    )
}

export default SaleDialog
