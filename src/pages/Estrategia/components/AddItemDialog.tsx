import { useEffect, useId, useState } from 'react'
import { CheckIcon, Loader2Icon, SearchIcon } from 'lucide-react'
import { toast } from 'sonner'

import { useInventoryCatalog } from '@/hooks/useInventory'
import { CatalogProduct, InventoryItem, NewInventoryItemPayload } from '@/interfaces/inventory'
import { cn } from '@/lib/utils'
import { friendlyError, money, parseAmount, pieces } from '../format'
import { Chip } from './Chips'
import Field from './Field'
import Panel from './Panel'
import Stepper from './Stepper'

interface Props {
    open: boolean
    onClose: () => void
    onSave: (payload: NewInventoryItemPayload) => Promise<unknown>
    saving: boolean
    /** Lo que ya tiene: si escoge un producto que ya está, se le suman las piezas */
    existing?: InventoryItem[]
}

/** Las sugerencias que se ven a la vez; la API manda hasta 15 */
const SHOWN = 8

/**
 * El nombre que se guarda: el de la lista y, si tiene, su tono al final («… Tono Red My Mind»). Así se lee en su
 * inventario y la biblioteca encuentra su imagen (ignora el «Tono …»).
 */
const savedName = (product: CatalogProduct) => {
    const shade = product.shade?.replace(/^tono\s+/i, '').trim()
    return shade ? `${product.name} Tono ${shade}` : product.name
}

/**
 * «+ Agregar algo que no sale en tus pedidos»: lo compró antes de la ventana o fuera del portal. Mientras escribe le
 * salen los productos de Mary Kay de su país; al escoger uno queda ligado a su clave (con su precio y, si ya la tiene,
 * su imagen para compartir). Si no está en la lista, lo deja escrito a su modo, como antes.
 */
const AddItemDialog = ({ open, onClose, onSave, saving, existing = [] }: Props) => {
    const [name, setName] = useState('')
    const [chosen, setChosen] = useState<CatalogProduct | null>(null)
    const [quantity, setQuantity] = useState(1)
    const [price, setPrice] = useState('')
    const [active, setActive] = useState(0)
    const listId = useId()

    useEffect(() => {
        if (!open) return
        setName('')
        setChosen(null)
        setQuantity(1)
        setPrice('')
    }, [open])

    const catalog = useInventoryCatalog(name, open && !chosen)
    const shown = catalog.products.slice(0, SHOWN)
    const typed = name.trim().length >= 2
    const listed = !chosen && typed && shown.length > 0
    // Con otra lista, la marcada vuelve a ser la primera
    const signature = shown.map(product => product.sku).join(',')
    useEffect(() => { setActive(0) }, [signature])

    const owned = chosen ? existing.find(item => item.sku === chosen.sku) ?? null : null
    const valid = (!!chosen || typed) && quantity > 0

    const choose = (product: CatalogProduct) => {
        setChosen(product)
        setPrice(product.price ? String(product.price) : '')
    }

    /** «Cambiar»: regresa al buscador con el nombre (sin el tono, para ver los demás) */
    const unchoose = () => {
        if (chosen) setName(chosen.name)
        setChosen(null)
        setPrice('')
    }

    const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (!listed) return
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault()
            setActive(current => (current + (event.key === 'ArrowDown' ? 1 : -1) + shown.length) % shown.length)
        } else if (event.key === 'Enter') {
            event.preventDefault()
            choose(shown[Math.min(active, shown.length - 1)])
        }
    }

    const submit = async () => {
        if (!valid) return
        const amount = owned ? null : parseAmount(price)
        const label = chosen ? chosen.name : name.trim()
        const payload: NewInventoryItemPayload = chosen
            ? { sku: chosen.sku, name: savedName(chosen), quantity, ...(amount !== null ? { price: amount } : {}) }
            : { name: name.trim(), quantity, ...(amount !== null ? { price: amount } : {}) }
        try {
            await onSave(payload)
            toast.success(owned ? `Listo: le sumé ${pieces(quantity)} a ${label}.`
                : chosen?.has_image ? `Listo: ${label} ya está en tu inventario, con su imagen para compartir.`
                    : `Listo: ${label} ya está en tu inventario.`)
            onClose()
        } catch (error) {
            toast.error(friendlyError(error, 'No se pudo agregar. Intenta de nuevo.'))
        }
    }

    const hint = (text: React.ReactNode) => <p className="px-1 text-[12px] leading-snug text-muted-foreground">{text}</p>

    return (
        <Panel
            open={open}
            onClose={onClose}
            title="Agregar a tu inventario"
            description="Lo que tienes y no sale en tus pedidos. Escógelo de la lista de Mary Kay: queda con su precio y, si ya la tiene, su imagen para compartir."
            className="sm:max-w-[480px]"
            footer={
                <button type="button" disabled={!valid || saving} onClick={submit} className="hoy-cta flex h-12 w-full cursor-pointer items-center justify-center rounded-full text-[14.5px] font-bold text-white disabled:cursor-default disabled:opacity-50">
                    {saving ? <Loader2Icon className="size-5 animate-spin" /> : owned ? 'Sumar a mi inventario' : 'Agregar a mi inventario'}
                </button>
            }
        >
            <div className="grid gap-3">
                {chosen ? (
                    <div className="flex items-start gap-3 rounded-[14px] border-[1.5px] border-[#6C47FF] bg-[#6C47FF]/[0.06] px-3 py-2.5">
                        <CheckIcon className="mt-[18px] size-4 shrink-0 text-[#6C47FF] dark:text-[#A894FF]" />
                        <span className="min-w-0 flex-1">
                            <small className="block text-[10.5px] font-bold tracking-wider text-muted-foreground uppercase">De la lista de Mary Kay</small>
                            <b className="block text-[14px] leading-snug font-bold">{chosen.name}</b>
                            {chosen.shade && <span className="block text-[12px] font-semibold text-muted-foreground">Tono {chosen.shade.replace(/^tono\s+/i, '')}</span>}
                            {(chosen.price || chosen.has_image) && (
                                <span className="mt-1 flex flex-wrap gap-1">
                                    {chosen.price ? <Chip tone="green">{money(chosen.price)}</Chip> : null}
                                    {chosen.has_image && <Chip tone="violet">Con su imagen para compartir</Chip>}
                                </span>
                            )}
                        </span>
                        <button type="button" onClick={unchoose} className="mt-[16px] shrink-0 cursor-pointer text-[12.5px] font-semibold text-[#6C47FF] hover:underline dark:text-[#A894FF]">Cambiar</button>
                    </div>
                ) : (
                    <div>
                        <label className="block rounded-[14px] border-[1.5px] border-border bg-card px-3 py-2 transition-shadow focus-within:border-[#6C47FF] focus-within:shadow-[0_0_0_3px_rgba(108,71,255,0.15)]">
                            <small className="block text-[10.5px] font-bold tracking-wider text-muted-foreground uppercase">¿Qué producto es?</small>
                            <span className="flex items-center gap-2">
                                <input
                                    value={name}
                                    onChange={event => setName(event.target.value)}
                                    onKeyDown={onKeyDown}
                                    placeholder="Escribe y escoge, ej. Tónico Balanceador"
                                    autoFocus
                                    autoComplete="off"
                                    role="combobox"
                                    aria-expanded={listed}
                                    aria-controls={listId}
                                    aria-autocomplete="list"
                                    aria-activedescendant={listed ? `${listId}-${active}` : undefined}
                                    className="min-h-[22px] w-full min-w-0 flex-1 border-0 bg-transparent p-0 text-sm font-semibold outline-none placeholder:font-medium placeholder:text-muted-foreground/60"
                                />
                                {catalog.searching ? <Loader2Icon className="size-4 shrink-0 animate-spin text-muted-foreground" /> : <SearchIcon className="size-4 shrink-0 text-muted-foreground/70" />}
                            </span>
                        </label>

                        {listed && (
                            <div id={listId} role="listbox" aria-label="Productos de Mary Kay" className="mt-2 overflow-hidden rounded-[14px] border border-border bg-card">
                                {shown.map((product, index) => (
                                    <button
                                        key={product.sku}
                                        id={`${listId}-${index}`}
                                        type="button"
                                        role="option"
                                        aria-selected={index === active}
                                        onMouseEnter={() => setActive(index)}
                                        onClick={() => choose(product)}
                                        className={cn('flex w-full cursor-pointer items-center gap-3 border-b border-border px-3 py-2 text-left last:border-b-0', index === active && 'bg-[#6C47FF]/[0.07]')}
                                    >
                                        <span className="min-w-0 flex-1">
                                            <b className="block text-[13.5px] leading-snug font-bold">{product.name}</b>
                                            {(product.shade || product.has_image) && (
                                                <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                                                    {product.shade && <span className="text-[11.5px] font-semibold text-muted-foreground">{product.shade}</span>}
                                                    {product.has_image && <Chip tone="violet" className="h-[19px] px-2 text-[10px]">con imagen</Chip>}
                                                </span>
                                            )}
                                        </span>
                                        {product.price ? <span className="shrink-0 text-[13px] font-extrabold tabular-nums">{money(product.price)}</span> : null}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="mt-2">
                            {!typed ? hint('Escribe el nombre y escógelo de la lista.')
                                : listed ? hint(<>{catalog.products.length > SHOWN && 'Hay más: escribe también el tono para afinar. '}¿No es ninguno? Déjalo escrito así y se agrega con ese nombre.</>)
                                    : catalog.failed ? hint('No pude buscar en la lista ahora. Déjalo escrito así y se agrega con ese nombre.')
                                        : catalog.searched ? hint('No sale en la lista. Revisa cómo lo escribiste o déjalo así: se agrega con ese nombre, sin imagen.')
                                            : hint('Buscando en la lista de Mary Kay…')}
                        </div>
                    </div>
                )}

                {owned && (
                    <p className="rounded-2xl bg-[#6C47FF]/10 px-3.5 py-2.5 text-[12.5px] leading-snug">
                        <b>Ya lo tienes en tu inventario.</b> {owned.on_hand > 0 ? `Se suman a las ${pieces(owned.on_hand)} que te quedan.` : 'Se te había acabado: vuelve con las que pongas.'}
                    </p>
                )}

                <div className="flex items-center justify-between rounded-[14px] border-[1.5px] border-border bg-card px-3 py-2">
                    <small className="text-[10.5px] font-bold tracking-wider text-muted-foreground uppercase">{owned ? '¿Cuántas le sumas?' : '¿Cuántas tienes?'}</small>
                    <Stepper value={quantity} min={1} onChange={setQuantity} label="piezas" />
                </div>
                {!owned && (
                    <>
                        <Field label={chosen?.price ? 'Precio para tu clienta' : 'Precio para tu clienta (opcional)'} value={price} onChange={setPrice} placeholder="Precio de catálogo, con IVA" inputMode="decimal" prefix="$" />
                        {hint(chosen?.price ? 'Es el de catálogo, con IVA. Sin factura no sabemos cuánto te costó: su ganancia no entra en tu cuenta.' : 'Sin factura no sabemos cuánto te costó: su ganancia no entra en tu cuenta.')}
                    </>
                )}
            </div>
        </Panel>
    )
}

export default AddItemDialog
