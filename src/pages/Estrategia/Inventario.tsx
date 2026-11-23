import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { CheckIcon, ImagesIcon, Loader2Icon, SparklesIcon } from 'lucide-react'
import { toast } from 'sonner'

import { APP_ROUTES } from '@/constants/app'
import { CustomerSale, InventoryItem } from '@/interfaces/inventory'
import useInventory, { useSales } from '@/hooks/useInventory'
import PageHead from '@/layouts/TopShell/PageHead'
import { cn } from '@/lib/utils'
import { dayLabel, friendlyError, money, pieces } from './format'
import { groupItems } from './groups'
import { groupByCategory } from './categories'
import { isStrategyLockedError, useStrategyAccess } from './feature'
import StrategyLock from './components/StrategyLock'
import AddItemsSheet from './components/AddItemsSheet'
import NextOrderCard from './components/NextOrderCard'
import { Card } from './components/Chips'
import ItemRow, { ItemGroup } from './components/ItemRow'
import HowToDialog from './components/HowToDialog'
import SaleDialog, { SalePreset } from './components/SaleDialog'
import ItemShareDialog from './components/ItemShareDialog'
import ItemPriceDialog from './components/ItemPriceDialog'
import SalesList from './components/SalesList'
import ConnectMaryKay from './components/ConnectMaryKay'

export const Figure = ({ label, value, win = false, wide = false }: { label: string, value: string, win?: boolean, wide?: boolean }) => (
    <div className={cn('rounded-2xl px-3.5 py-3', wide && 'col-span-2', win ? 'bg-[linear-gradient(135deg,#E5077D,#6C47FF)] text-white' : 'bg-foreground/[0.04]')}>
        <small className={cn('block text-[11.5px] leading-tight font-semibold', win ? 'text-white/90' : 'text-muted-foreground')}>{label}</small>
        <b className={cn('mt-0.5 block leading-tight font-extrabold tabular-nums', win ? 'text-[28px]' : 'text-[21px]')}>{value}</b>
    </div>
)

export const SellButton = ({ onClick, className }: { onClick: () => void, className?: string }) => (
    <button type="button" onClick={onClick} className={cn('hoy-cta flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full px-5 text-[14px] font-bold text-white', className)}>
        Ya me compró
    </button>
)

type View = 'pedido' | 'categoria'
const VIEW_KEY = 'tu-inventario:vista'

/** La vista que escogió la última vez (en este navegador); `?vista=` la cambia desde una liga */
const savedView = (): View | null => {
    try {
        const value = localStorage.getItem(VIEW_KEY)
        return value === 'pedido' || value === 'categoria' ? value : null
    } catch {
        return null
    }
}

/**
 * «Tu inventario» (plan Standard «Tu estrategia»), en la web. Sale solo de sus órdenes de Mary Kay: lo guardado de
 * pedidos anteriores va primero («Muévelo primero»), lo revisa UNA vez y baja cuando anota «Ya me compró».
 */
const InventarioPage = () => {
    const access = useStrategyAccess()
    const [params] = useSearchParams()
    const { data, loading, error, refetch, stepOnHand, review, addItems, setPrice } = useInventory({
        // Con plan gratis no se pide (la API respondería 403): va el candado
        enabled: !access.locked,
        onSaveError: saveError => toast.error(friendlyError(saveError, 'No se guardó ese cambio. Intenta de nuevo.')),
    })
    const sales = useSales({ perPage: 6, enabled: !access.locked })
    const locked = access.locked || isStrategyLockedError(error)
    const [adding, setAdding] = useState(params.get('agregar') === '1')
    const linked = params.get('vista')
    const [chosenView, setChosenView] = useState<View | null>(linked === 'pedido' || linked === 'categoria' ? linked : savedView)
    const chooseView = (view: View) => {
        setChosenView(view)
        try { localStorage.setItem(VIEW_KEY, view) } catch { /* sin almacenamiento: sólo esta visita */ }
    }
    const [selling, setSelling] = useState<{ preset: SalePreset | null } | null>(null)
    const [sharing, setSharing] = useState<InventoryItem | null>(null)
    const [pricing, setPricing] = useState<InventoryItem | null>(null)
    const [showOut, setShowOut] = useState(false)
    const [howto, setHowto] = useState<CustomerSale | null>(null)

    /*
     * La revisión de una sola vez. Para la API ya está «revisado» en cuanto corrige UN producto (o agrega uno a mano):
     * por eso el aviso se queda toda esta visita, hasta que toque «Ya lo revisé» o ya no quede nada sin revisar.
     */
    const [reviewing, setReviewing] = useState(false)
    useEffect(() => { if (data && !data.reviewed) setReviewing(true) }, [data])
    const pendingReview = !!data && data.items.some(item => item.on_hand > 0 && !item.manual && !item.reviewed)
    const showReview = !!data && (!data.reviewed || (reviewing && pendingReview))

    const groups = data ? groupItems(data) : null
    const summary = data?.summary
    const hasItems = !!data && data.items.length > 0
    const lastOrder = data?.last_order
    // Los que ya tienen su imagen de la biblioteca (con su logo) y le quedan: cada uno con su «Compartir»
    const shareable = data ? data.items.filter(item => item.piece && item.on_hand > 0).length : 0
    // Sin pedidos bajados, «por pedido» sería una sola lista de lo que agregó: se ve por categoría (sin escoger)
    const byOrder = !!lastOrder
    const view: View = !byOrder ? 'categoria' : chosenView ?? 'pedido'
    const categories = groups && view === 'categoria' ? groupByCategory([...groups.older, ...groups.last, ...groups.manual]) : null
    // Cada producto con su parte (para el renglón: «del 2 de octubre», «lo agregaste tú»…) aunque se vea por categoría
    // Con algo que pedir va arriba de todo; mientras no (todavía no se vende nada, o le alcanza), abajo de lo que tiene
    const nextOrderFirst = !!data?.next_order?.lines.length
    const groupOf = new Map<string, ItemGroup>(groups ? (['older', 'last', 'manual'] as const).flatMap(group => groups[group].map(item => [item.sku, group] as [string, ItemGroup])) : [])

    /** «Ya me compró» desde «Compartir»: con ese producto, a su precio */
    const sellItem = (item: InventoryItem) => {
        setSharing(null)
        setSelling({ preset: { lines: [{ sku: item.sku, quantity: 1 }] } })
    }

    const onReview = () => review.mutate(undefined, {
        onSuccess: () => { setReviewing(false); toast.success('Listo. Desde hoy cada pedido nuevo se suma solo.') },
        onError: reviewError => toast.error(friendlyError(reviewError, 'No se pudo guardar. Intenta de nuevo.')),
    })

    const rows = (items: InventoryItem[], group: ItemGroup) => items.map(item => (
        <ItemRow key={item.sku} item={item} group={group} onStep={delta => stepOnHand(item.sku, delta)} onShare={setSharing} onPrice={setPricing} />
    ))
    const heading = (text: string) => <p className="mt-4 text-[13px] font-extrabold first:mt-3">{text}</p>

    return (
        <div className="flex flex-col gap-4 pt-2">
            <PageHead
                eyebrow="Tu estrategia"
                title={<>Tu <em>inventario</em></>}
                sub={data ? (lastOrder ? `Sale solo de tus pedidos de Mary Kay de los últimos ${data.lookback_months} meses (el último, del ${dayLabel(lastOrder.date)}) y de lo que agregas tú. Lo que vendes baja al anotarlo en «Ya me compró».` : 'Lo que tienes guardado: agrégalo de la lista de Mary Kay. Lo que vendes baja al anotarlo en «Ya me compró».') : 'Lo que compraste, a la mano.'}
            >
                <Link to={APP_ROUTES.STRATEGY} className="flex h-11 items-center gap-2 rounded-full border border-border bg-card px-4 text-[13.5px] font-semibold hover:border-[#6C47FF]/40">
                    <SparklesIcon className="size-4 text-[#6C47FF]" /> Tu estrategia
                </Link>
                {data && !error && !locked && <SellButton onClick={() => setSelling({ preset: null })} />}
            </PageHead>

            {!locked && <ConnectMaryKay />}

            {locked ? (
                <StrategyLock title="Tu inventario viene con el Plan Standard" text="Tus pedidos de Mary Kay se suman solos, ves cuánto tienes guardado y lo que te costó, y lo que vendes baja al anotarlo en «Ya me compró»." />
            ) : loading ? (
                <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
                    <div className="hoy-skel h-[420px] rounded-3xl" />
                    <div className="hoy-skel h-[260px] rounded-3xl" />
                </div>
            ) : error || !data ? (
                <Card className="py-10 text-center">
                    <p className="text-[15px] font-extrabold">No pudimos traer tu inventario</p>
                    <p className="mt-1 text-[13px] text-muted-foreground">{friendlyError(error, 'Revisa tu conexión e intenta de nuevo.')}</p>
                    <button type="button" onClick={() => refetch()} className="hoy-cta mt-4 h-11 cursor-pointer rounded-full px-6 text-[13.5px] font-bold text-white">Intentar de nuevo</button>
                </Card>
            ) : (
                <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
                    <div className="grid min-w-0 grid-cols-1 gap-4">
                        {hasItems && nextOrderFirst && data.next_order && <NextOrderCard nextOrder={data.next_order} />}
                        <Card title="Lo que tienes" aside={hasItems ? <small className="text-[11.5px] font-bold text-muted-foreground">te quedan</small> : undefined}>
                            {hasItems && byOrder && (
                                <div role="tablist" aria-label="Cómo ver tu inventario" className="mt-3 grid grid-cols-2 gap-1 rounded-full bg-foreground/[0.05] p-1">
                                    {([['pedido', 'Por pedido'], ['categoria', 'Por categoría']] as const).map(([key, label]) => (
                                        <button key={key} type="button" role="tab" aria-selected={view === key} onClick={() => chooseView(key)}
                                            className={cn('h-9 cursor-pointer rounded-full text-[13px] font-bold transition-colors', view === key ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            )}
                            {hasItems && (!showReview ? (
                                <p className="mt-3 flex items-start gap-2 rounded-2xl bg-emerald-500/10 px-3.5 py-2.5 text-[13px] leading-snug text-emerald-800 dark:text-emerald-200">
                                    <CheckIcon className="mt-0.5 size-4 shrink-0" />
                                    <span><b>Al día.</b> {byOrder ? 'Lo que pidas se suma solo y lo que vendes baja al anotarlo en «Ya me compró».' : 'Lo que vendes baja al anotarlo en «Ya me compró». Cuando te llegue tu pedido, agrégalo aquí.'}</span>
                                </p>
                            ) : (
                                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl bg-[#6C47FF]/10 px-3.5 py-3 text-[13px] leading-snug">
                                    <CheckIcon className="size-4 shrink-0 text-[#6C47FF]" />
                                    <span className="min-w-[220px] flex-1"><b>Revísalo una sola vez.</b> Corrige cuántas te quedan de cada cosa con − y +; después cada pedido nuevo se suma solo.</span>
                                    <button type="button" disabled={review.isPending} onClick={onReview} className="flex h-9 min-w-[124px] cursor-pointer items-center justify-center rounded-full bg-[#4E31C0] px-4 text-[13px] font-bold text-white disabled:opacity-70">
                                        {review.isPending ? <Loader2Icon className="size-4 animate-spin" /> : 'Ya lo revisé'}
                                    </button>
                                </div>
                            ))}

                            {shareable > 0 && (
                                <p className="mt-2 flex items-start gap-2 px-1 text-[12.5px] leading-snug text-muted-foreground">
                                    <ImagesIcon className="mt-0.5 size-4 shrink-0 text-[#6C47FF] dark:text-[#A894FF]" />
                                    <span><b className="text-foreground">{shareable === 1 ? 'Un producto ya tiene' : `${shareable} productos ya tienen`} su imagen con tu logo.</b> Tócale «Compartir» para mandárselo a tus clientas.</span>
                                </p>
                            )}

                            {!hasItems && (
                                <div className="mt-3 rounded-2xl bg-[linear-gradient(135deg,rgba(229,7,125,.07),rgba(108,71,255,.10))] px-4 py-6 text-center">
                                    {/* Textos de «Mary Kay opcional» (f4c4671, en producción desde el 19-nov): se conservan */}
                                    <p className="text-[15px] font-extrabold">Agrega lo que tienes guardado</p>
                                    <p className="mx-auto mt-1 max-w-[46ch] text-[13px] leading-snug text-muted-foreground">Escógelo de la lista de Mary Kay y queda con su precio. Si conectas tu Mary Kay (es opcional), tus pedidos también se suman solos.</p>
                                    <button type="button" onClick={() => setAdding(true)} className="hoy-cta mt-4 h-11 cursor-pointer rounded-full px-6 text-[14px] font-bold text-white">+ Agregar de la lista de Mary Kay</button>
                                </div>
                            )}

                            {categories ? categories.map(category => (
                                <div key={category.key}>
                                    <p className="mt-4 flex items-baseline justify-between gap-2 text-[13px] font-extrabold first:mt-3">
                                        <span>{category.title}</span>
                                        <small className="text-[11.5px] font-semibold text-muted-foreground tabular-nums">{pieces(category.units)} {category.units === 1 ? 'pieza' : 'piezas'}{category.value > 0 && <> · {money(category.value)}</>}</small>
                                    </p>
                                    {category.items.map(item => (
                                        <ItemRow key={item.sku} item={item} group={byOrder ? groupOf.get(item.sku) ?? 'manual' : 'mine'} onStep={delta => stepOnHand(item.sku, delta)} onShare={setSharing} onPrice={setPricing} />
                                    ))}
                                </div>
                            )) : (
                                <>
                                    {groups && groups.older.length > 0 && <>{heading('Guardado de pedidos anteriores')}{rows(groups.older, 'older')}</>}
                                    {groups && groups.last.length > 0 && lastOrder && <>{heading(`Del pedido del ${dayLabel(lastOrder.date)}`)}{rows(groups.last, 'last')}</>}
                                    {groups && groups.manual.length > 0 && <>{heading('Lo que agregaste tú')}{rows(groups.manual, 'manual')}</>}
                                </>
                            )}

                            {groups && groups.out.length > 0 && (
                                <>
                                    <button type="button" onClick={() => setShowOut(value => !value)} className="mt-4 flex w-full cursor-pointer items-center justify-between text-[13px] font-extrabold text-muted-foreground">
                                        <span>Se te acabaron ({groups.out.length})</span>
                                        <span className="text-[12.5px] font-semibold text-[#6C47FF] dark:text-[#A894FF]">{showOut ? 'Ocultar' : 'Ver'}</span>
                                    </button>
                                    {showOut && rows(groups.out, 'out')}
                                </>
                            )}

                            {hasItems && (
                                <button type="button" onClick={() => setAdding(true)} className="mt-3 w-full cursor-pointer rounded-full border border-dashed border-[#6C47FF]/45 py-2.5 text-[13px] font-semibold text-[#4E31C0] hover:bg-[#6C47FF]/5 dark:text-[#BBAAFF]">
                                    + {byOrder ? 'Agregar algo que no sale en tus pedidos' : 'Agregar más de la lista de Mary Kay'}
                                </button>
                            )}
                        </Card>
                        {hasItems && data.next_order && !nextOrderFirst && <NextOrderCard nextOrder={data.next_order} />}
                    </div>

                    <div className="grid grid-cols-1 gap-4 xl:sticky xl:top-[90px]">
                        {summary && summary.products > 0 && (
                            <Card title="Tu cuenta">
                                {summary.without_cost < summary.products ? (
                                    <div className="mt-3 grid grid-cols-2 gap-2">
                                        <Figure label="Tienes guardado (precio de catálogo)" value={money(summary.catalog_value)} />
                                        <Figure label="Te costó" value={money(summary.cost)} />
                                        <Figure label="Tu ganancia al venderlo" value={money(summary.profit)} win wide />
                                    </div>
                                ) : (
                                    // Nada tiene factura (lo agregó todo ella): sin «Te costó $0» ni «ganancia $0»
                                    <div className="mt-3 grid grid-cols-2 gap-2">
                                        <Figure label="Tienes para vender (precio de catálogo)" value={money(summary.catalog_value)} win wide />
                                    </div>
                                )}
                                <p className="mt-3 text-[12px] leading-snug text-muted-foreground">
                                    Precios con IVA.
                                    {summary.stale > 0 && <> Tienes <b className="text-foreground">{summary.stale} {summary.stale === 1 ? 'producto guardado' : 'productos guardados'}</b> desde hace más de un mes: muévelos primero.</>}
                                    {summary.without_cost === summary.products
                                        ? <> Lo que te costó y tu ganancia salen de tus facturas de Mary Kay: aparecen cuando conectes tu cuenta.</>
                                        : summary.without_cost > 0 && <> {summary.without_cost === 1 ? 'Un producto no tiene' : `${summary.without_cost} productos no tienen`} factura todavía: su ganancia no entra aquí.</>}
                                </p>
                            </Card>
                        )}

                        <Card title="Lo último que vendiste" aside={sales.data?.total_items ? <small className="text-[11.5px] font-semibold text-muted-foreground">{sales.data.total_items} {sales.data.total_items === 1 ? 'venta' : 'ventas'}</small> : undefined}>
                            {sales.data?.items.length ? (
                                <div className="mt-1"><SalesList sales={sales.data.items} showCustomer onHowTo={setHowto} /></div>
                            ) : (
                                <p className="mt-2 text-[13px] text-muted-foreground">Todavía no anotas ventas. Cada vez que vendas, tócale «Ya me compró»: baja de tu inventario y queda en la ficha de tu clienta.</p>
                            )}
                            <SellButton onClick={() => setSelling({ preset: null })} className="mt-3 w-full" />
                        </Card>
                    </div>
                </div>
            )}

            <AddItemsSheet open={adding} onClose={() => setAdding(false)} onSave={items => addItems.mutateAsync({ items })} saving={addItems.isPending} existing={data?.items} />
            <ItemShareDialog item={sharing} onClose={() => setSharing(null)} onSold={sellItem} />
            <ItemPriceDialog item={pricing} onClose={() => setPricing(null)} onSave={(sku, price) => setPrice.mutateAsync({ sku, price })} saving={setPrice.isPending} />
            <SaleDialog open={!!selling} onClose={() => setSelling(null)} preset={selling?.preset ?? null} />
            <HowToDialog sale={howto} onClose={() => setHowto(null)} />
        </div>
    )
}

export default InventarioPage
