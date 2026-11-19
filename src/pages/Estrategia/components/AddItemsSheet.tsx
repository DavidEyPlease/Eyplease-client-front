import { useEffect, useMemo, useState } from 'react'
import { Loader2Icon, PencilLineIcon, SearchIcon, XIcon } from 'lucide-react'
import { toast } from 'sonner'

import { useInventoryCatalog } from '@/hooks/useInventory'
import { CatalogProduct, InventoryItem, NewInventoryItemPayload } from '@/interfaces/inventory'
import { cn } from '@/lib/utils'
import { CATEGORIES } from '../categories'
import { friendlyError, money, parseAmount, pieces } from '../format'
import { Chip } from './Chips'
import Panel from './Panel'
import ProductShape from './ProductShape'
import Stepper from './Stepper'

interface Props {
    open: boolean
    onClose: () => void
    onSave: (items: NewInventoryItemPayload[]) => Promise<unknown>
    saving: boolean
    /** Lo que ya tiene: lo que escoja de eso se le suma */
    existing?: InventoryItem[]
}

/** Lo que va escogiendo: un producto de la lista (por su clave) o uno escrito a su modo */
interface Picked {
    key: string
    product: CatalogProduct | null
    name: string
    shade: string | null
    price: number | null
    quantity: number
}

/** Las pestañas de arriba: lo más pedido, cada categoría y lo que ya escogió */
const TABS = [{ key: 'todo', label: 'Lo más pedido' }, ...CATEGORIES.filter(category => category.key !== 'otros').map(category => ({ key: category.key, label: category.short }))]

/**
 * El nombre que se guarda: el de la lista y, si tiene, su tono al final («… Tono Red My Mind»). Así se lee en su
 * inventario y la biblioteca encuentra su imagen (ignora el «Tono …»).
 */
const savedName = (product: CatalogProduct) => {
    const shade = product.shade?.replace(/^tono\s+/i, '').trim()
    return shade ? `${product.name} Tono ${shade}` : product.name
}

const shadeLabel = (shade: string | null) => shade ? `Tono ${shade.replace(/^tono\s+/i, '')}` : null

/**
 * «Agrega lo que tienes» (noviembre 2026): la carga de una sola vez, sin dar su contraseña de Mary Kay. Escoge de la
 * lista de su país (lo más pedido, por categoría o buscando) y pone cuántas tiene de cada uno; todo se guarda junto con
 * su precio de lista. Lo que no esté en la lista lo escribe a su modo. Antes se agregaba uno por uno.
 */
const AddItemsSheet = ({ open, onClose, onSave, saving, existing = [] }: Props) => {
    const [text, setText] = useState('')
    const [tab, setTab] = useState('todo')
    const [picked, setPicked] = useState<Picked[]>([])
    const [writing, setWriting] = useState<{ name: string, price: string, quantity: number } | null>(null)

    useEffect(() => {
        if (!open) return
        setText('')
        setTab('todo')
        setPicked([])
        setWriting(null)
    }, [open])

    // Si quita todo lo escogido, regresa a la lista
    useEffect(() => { if (!picked.length) setTab(current => current === 'escogidos' ? 'todo' : current) }, [picked.length])

    const searchingText = text.trim().length >= 2
    const showPicked = tab === 'escogidos' && !searchingText
    const catalog = useInventoryCatalog(text, open && !showPicked, searchingText || tab === 'todo' || tab === 'escogidos' ? null : tab)
    const owned = useMemo(() => new Map(existing.map(item => [item.sku, item])), [existing])

    const quantityOf = (key: string) => picked.find(item => item.key === key)?.quantity ?? 0
    const setQuantity = (key: string, quantity: number, from?: Omit<Picked, 'quantity'>) => setPicked(current => {
        if (quantity <= 0) return current.filter(item => item.key !== key)
        if (current.some(item => item.key === key)) return current.map(item => item.key === key ? { ...item, quantity } : item)
        return from ? [...current, { ...from, quantity }] : current
    })
    const fromProduct = (product: CatalogProduct): Omit<Picked, 'quantity'> => ({ key: product.sku, product, name: product.name, shade: product.shade, price: product.price })

    const units = picked.reduce((sum, item) => sum + item.quantity, 0)
    const value = picked.reduce((sum, item) => sum + (item.price ?? 0) * item.quantity, 0)

    const addWritten = () => {
        if (!writing || writing.name.trim().length < 2) return
        const price = parseAmount(writing.price)
        setPicked(current => [...current, { key: `escrito-${Date.now()}`, product: null, name: writing.name.trim(), shade: null, price, quantity: writing.quantity }])
        setWriting(null)
        setText('')
    }

    const submit = async () => {
        if (!picked.length) return
        const items: NewInventoryItemPayload[] = picked.map(item => item.product
            ? { sku: item.product.sku, name: savedName(item.product), quantity: item.quantity, ...(item.price ? { price: item.price } : {}) }
            : { name: item.name, quantity: item.quantity, ...(item.price !== null ? { price: item.price } : {}) })
        try {
            await onSave(items)
            toast.success(`Listo: ${picked.length === 1 ? 'un producto' : `${picked.length} productos`} (${pieces(units)} ${units === 1 ? 'pieza' : 'piezas'}) en tu inventario.`)
            onClose()
        } catch (error) {
            toast.error(friendlyError(error, 'No se pudo agregar. Intenta de nuevo.'))
        }
    }

    const row = (key: string, name: string, shade: string | null, price: number | null, extra: React.ReactNode, from?: Omit<Picked, 'quantity'>) => {
        const quantity = quantityOf(key)
        const mine = owned.get(key)
        return (
            <div key={key} className={cn('flex items-center gap-3 border-b border-border py-2.5 last:border-b-0', quantity > 0 && '-mx-2 rounded-xl border-transparent bg-[#6C47FF]/[0.06] px-2')}>
                <ProductShape name={name} className="size-9" />
                <span className="min-w-0 flex-1">
                    <b className="block text-[13.5px] leading-snug font-bold">{name}</b>
                    <span className="block text-[11.5px] leading-snug text-muted-foreground">
                        {[shadeLabel(shade), price ? money(price) : 'sin precio'].filter(Boolean).join(' · ')}
                    </span>
                    {(extra || (mine && mine.on_hand > 0)) && (
                        <span className="mt-1 flex flex-wrap items-center gap-1">
                            {mine && mine.on_hand > 0 && <Chip tone="amber">ya tienes {pieces(mine.on_hand)}: se suman</Chip>}
                            {extra}
                        </span>
                    )}
                </span>
                {quantity > 0
                    ? <Stepper value={quantity} min={0} onChange={next => setQuantity(key, next)} label={name} />
                    : (
                        <button type="button" aria-label={`Agregar ${name}`} onClick={() => setQuantity(key, 1, from)}
                            className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-full border-[1.5px] border-[#6C47FF]/45 text-[20px] leading-none font-bold text-[#4E31C0] transition-colors hover:bg-[#6C47FF]/10 dark:text-[#BBAAFF]">
                            +
                        </button>
                    )}
            </div>
        )
    }

    const hint = (content: React.ReactNode) => <p className="px-1 py-3 text-center text-[12.5px] leading-snug text-muted-foreground">{content}</p>

    const writeIn = writing ? (
        <div className="mt-3 grid gap-2 rounded-2xl border-[1.5px] border-[#6C47FF]/40 bg-[#6C47FF]/[0.04] p-3">
            <div className="flex items-center justify-between">
                <b className="text-[13px] font-extrabold">Escríbelo como lo conoces</b>
                <button type="button" onClick={() => setWriting(null)} aria-label="Cerrar" className="grid size-7 cursor-pointer place-items-center rounded-full text-muted-foreground hover:bg-foreground/5"><XIcon className="size-4" /></button>
            </div>
            <input value={writing.name} onChange={event => setWriting({ ...writing, name: event.target.value })} placeholder="Nombre y tono" autoFocus
                className="h-11 rounded-xl border-[1.5px] border-border bg-card px-3 text-[14px] font-semibold outline-none focus:border-[#6C47FF]" />
            <span className="flex h-11 items-center gap-1 rounded-xl border-[1.5px] border-border bg-card px-3 focus-within:border-[#6C47FF]">
                <span className="text-[14px] font-bold text-muted-foreground">$</span>
                <input value={writing.price} onChange={event => setWriting({ ...writing, price: event.target.value })} placeholder="Precio para tu clienta (con IVA)" inputMode="decimal"
                    className="h-full min-w-0 flex-1 border-0 bg-transparent text-[14px] font-semibold outline-none" />
            </span>
            <p className="text-[11.5px] leading-snug text-muted-foreground">Ponle su precio: sin él no cuenta en lo que tienes guardado ni en tu ganancia.</p>
            <span className="flex items-center justify-between rounded-xl border-[1.5px] border-border bg-card px-3 py-1.5">
                <small className="text-[10.5px] font-bold tracking-wider text-muted-foreground uppercase">¿Cuántas tienes?</small>
                <Stepper value={writing.quantity} min={1} onChange={quantity => setWriting({ ...writing, quantity })} label="piezas" />
            </span>
            <button type="button" disabled={writing.name.trim().length < 2} onClick={addWritten}
                className="h-10 cursor-pointer rounded-full bg-[#4E31C0] text-[13.5px] font-bold text-white disabled:cursor-default disabled:opacity-50">
                Agregar a mi lista
            </button>
        </div>
    ) : (
        <button type="button" onClick={() => setWriting({ name: searchingText ? text.trim() : '', price: '', quantity: 1 })}
            className="mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-dashed border-border py-2.5 text-[13px] font-semibold text-muted-foreground hover:border-[#6C47FF]/45 hover:text-foreground">
            <PencilLineIcon className="size-4" /> ¿No está en la lista? Escríbelo tú
        </button>
    )

    return (
        <Panel
            open={open}
            onClose={onClose}
            title="Agrega lo que tienes"
            description="Toca + en cada producto que tengas y pon cuántas. Quedan con su precio de catálogo. No hace falta tu contraseña de Mary Kay."
            className="h-[min(860px,92vh)] sm:max-w-[520px]"
            footer={
                <div className="grid gap-2">
                    <p className="text-center text-[12.5px] font-semibold text-muted-foreground">
                        {picked.length
                            ? <><b className="text-foreground">{picked.length === 1 ? '1 producto' : `${picked.length} productos`}</b> · {pieces(units)} {units === 1 ? 'pieza' : 'piezas'}{value > 0 && <> · {money(value)}</>}</>
                            : 'Todavía no escoges nada'}
                    </p>
                    <button type="button" disabled={!picked.length || saving} onClick={submit} className="hoy-cta flex h-12 w-full cursor-pointer items-center justify-center rounded-full text-[14.5px] font-bold text-white disabled:cursor-default disabled:opacity-50">
                        {saving ? <Loader2Icon className="size-5 animate-spin" /> : 'Agregar a mi inventario'}
                    </button>
                </div>
            }
        >
            <div className="sticky top-0 z-10 -mx-6 bg-background px-6 pb-2">
                <label className="flex h-11 items-center gap-2 rounded-[14px] border-[1.5px] border-border bg-card px-3 transition-shadow focus-within:border-[#6C47FF] focus-within:shadow-[0_0_0_3px_rgba(108,71,255,0.15)]">
                    {catalog.searching && searchingText ? <Loader2Icon className="size-4 shrink-0 animate-spin text-muted-foreground" /> : <SearchIcon className="size-4 shrink-0 text-muted-foreground/70" />}
                    <input value={text} onChange={event => setText(event.target.value)} placeholder="Busca, ej. TimeWise o Satin Hands" autoComplete="off" aria-label="Buscar en la lista de Mary Kay"
                        className="h-full min-w-0 flex-1 border-0 bg-transparent p-0 text-sm font-semibold outline-none placeholder:font-medium placeholder:text-muted-foreground/60" />
                    {text && <button type="button" onClick={() => setText('')} aria-label="Borrar búsqueda" className="grid size-6 cursor-pointer place-items-center rounded-full text-muted-foreground hover:bg-foreground/5"><XIcon className="size-3.5" /></button>}
                </label>
                {!searchingText && (
                    <div className="mt-2 -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none]" role="tablist" aria-label="Qué productos ver">
                        {[...TABS, ...(picked.length ? [{ key: 'escogidos', label: `Escogidos (${picked.length})` }] : [])].map(item => (
                            <button key={item.key} type="button" role="tab" aria-selected={tab === item.key} onClick={() => setTab(item.key)}
                                className={cn('h-8 shrink-0 cursor-pointer rounded-full px-3.5 text-[12.5px] font-bold whitespace-nowrap transition-colors',
                                    tab === item.key ? 'bg-[#4E31C0] text-white' : 'bg-foreground/[0.05] text-foreground/80 hover:bg-foreground/[0.09]',
                                    item.key === 'escogidos' && tab !== item.key && 'bg-[#6C47FF]/12 text-[#4E31C0] dark:text-[#BBAAFF]')}>
                                {item.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {showPicked ? (
                <div>{picked.map(item => row(item.key, item.name, item.shade, item.price, !item.product ? <Chip tone="violet">escrito por ti</Chip> : null))}</div>
            ) : (
                <div>
                    {catalog.products.map(product => row(product.sku, product.name, product.shade, product.price,
                        product.has_image ? <Chip tone="violet">con imagen</Chip> : null, fromProduct(product)))}
                    {catalog.products.length === 0 && (
                        catalog.failed ? hint('No pude abrir la lista ahora. Intenta de nuevo en un momento o escríbelo tú.')
                            : searchingText && catalog.searched ? hint(<>No sale «{text.trim()}» en la lista. Revisa cómo lo escribiste o escríbelo tú.</>)
                                : <div className="grid gap-2 py-2">{[0, 1, 2, 3].map(index => <div key={index} className="hoy-skel h-[52px] rounded-xl" />)}</div>
                    )}
                </div>
            )}

            {writeIn}
        </Panel>
    )
}

export default AddItemsSheet
