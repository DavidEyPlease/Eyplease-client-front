import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { BoxIcon, CheckIcon, CopyIcon, MessageCircleIcon } from 'lucide-react'
import { toast } from 'sonner'

import { APP_ROUTES } from '@/constants/app'
import { StrategyLevel, StrategyPiece } from '@/interfaces/strategy'
import useStrategy from '@/hooks/useStrategy'
import PageHead from '@/layouts/TopShell/PageHead'
import { cn } from '@/lib/utils'
import { titleCaseName } from '@/pages/Hoy/lib'
import { dayLabel, friendlyError, money, splitPrice } from './format'
import { Card, Chip } from './components/Chips'
import PieceBoceto from './components/PieceBoceto'
import SaleDialog, { SalePreset } from './components/SaleDialog'
import ShareDialog from './components/ShareDialog'
import usePieceCost from './usePieceCost'
import { Figure, SellButton } from './Inventario'

/** «Enfócate en maquillaje» con su enfoque en degradado; «Recupera tu inversión» con lo último («tu inversión») */
const Headline = ({ text, focus }: { text: string, focus: string | null }) => {
    if (focus && text.endsWith(focus)) return <>{text.slice(0, text.length - focus.length)}<em>{focus}</em></>
    const words = text.split(' ')
    const cut = Math.max(1, words.length - 2)
    return <>{words.slice(0, cut).join(' ')} <em>{words.slice(cut).join(' ')}</em></>
}

/** Lo que hizo del plan de la semana: en este navegador, por mes (no hace falta que viaje a la API). */
const useDone = (month: string | undefined) => {
    const key = `eyplease:estrategia:hechos:${month ?? ''}`
    const [done, setDone] = useState<number[]>([])
    useEffect(() => {
        if (!month) return
        try { setDone(JSON.parse(localStorage.getItem(key) ?? '[]')) } catch { setDone([]) }
    }, [key, month])
    const toggle = (index: number) => setDone(current => {
        const next = current.includes(index) ? current.filter(item => item !== index) : [...current, index]
        try { localStorage.setItem(key, JSON.stringify(next)) } catch { /* sin almacenamiento: sólo esta visita */ }
        return next
    })
    return { done, toggle }
}

const LevelCard = ({ level, month }: { level: StrategyLevel, month: string }) => (
    <Card title="Tu nivel">
        <p className="mt-2 text-[30px] leading-none font-extrabold tracking-tight">{level.level ? `Compras al ${level.level} %` : 'Sin nivel todavía'}</p>
        <p className="mt-2 text-[13px] leading-snug text-muted-foreground">
            Llevas <b className="text-foreground">{money(level.accumulated)}</b> en tu orden de {month} (Sección 1, sin IVA).
            {level.kept > level.earned && <> Este mes compras al {level.kept} % por lo que ganaste el mes pasado.</>}
        </p>
        {level.next ? (
            <p className="mt-2.5 rounded-2xl bg-[#6C47FF]/10 px-3.5 py-2.5 text-[13px] leading-snug">
                Te faltan <b>{money(level.next.missing)}</b> para ganar el <b>{level.next.level} %</b>.
            </p>
        ) : level.earned >= 50 ? (
            <p className="mt-2.5 rounded-2xl bg-emerald-500/10 px-3.5 py-2.5 text-[13px] leading-snug text-emerald-800 dark:text-emerald-200">Ya ganaste el 50 %: pide sólo lo que te vayan pidiendo.</p>
        ) : null}
        {level.keeps_next_month && level.earned > 0 && <p className="mt-2 text-[12px] text-muted-foreground">Lo que ganes este mes lo conservas el que entra.</p>}
    </Card>
)

const PieceCard = ({ piece, price, onShare }: { piece: StrategyPiece, price: number, onShare: () => void }) => {
    const cost = usePieceCost(piece)
    const gain = cost !== null ? price - cost : piece.profit
    return (
        <article className="flex flex-col gap-2.5 rounded-3xl border bg-card p-3 shadow-card">
            <button type="button" onClick={onShare} className="cursor-pointer rounded-[20px] transition-transform hover:-translate-y-0.5" aria-label={`Compartir ${piece.title}`}>
                <PieceBoceto piece={piece} price={price} />
            </button>
            <div className="px-1">
                <b className="line-clamp-2 text-[13.5px] leading-snug font-bold">{piece.title}</b>
                <span className="mt-1 flex flex-wrap items-center gap-1.5">
                    <small className="text-[12px] text-muted-foreground">{price < piece.normal_price ? `Promo ${money(price)} (normal ${money(piece.normal_price)})` : price > piece.normal_price ? `Tu precio ${money(price)} (catálogo ${money(piece.normal_price)})` : `Precio de catálogo ${money(price)}`}</small>
                    {gain !== null && <Chip tone={gain < 0 ? 'magenta' : 'green'}>{gain < 0 ? `pierdes ${money(-gain)}` : `ganas ${money(gain)}`}</Chip>}
                </span>
            </div>
            <button type="button" onClick={onShare} className="hoy-cta mt-auto flex h-10 cursor-pointer items-center justify-center rounded-full text-[13.5px] font-bold text-white">Compartir</button>
        </article>
    )
}

/**
 * «Tu estrategia» del mes (plan Standard, parte 3), en la web. La arma la API con su inventario, su nivel y sus ventas:
 * el enfoque y lo que más le urge mover, el plan de la semana, tres piezas con su precio (y lo que gana) y a qué
 * clientas volver a ofrecerles. Las piezas todavía son bocetos: el arte llega con la parte 4.
 */
const EstrategiaPage = () => {
    const { data, isLoading, error, refetch } = useStrategy()
    const { done, toggle } = useDone(data?.level.month)
    const [prices, setPrices] = useState<Record<string, number>>({})
    const [sharing, setSharing] = useState<StrategyPiece | null>(null)
    const [selling, setSelling] = useState<{ preset: SalePreset | null } | null>(null)

    const priceOf = (piece: StrategyPiece) => prices[piece.key] ?? piece.promo_price ?? piece.normal_price
    const byKey = new Map((data?.pieces ?? []).map(piece => [piece.key, piece]))

    /** «Ya me compró» con los productos de la pieza; el precio de paquete se reparte entre ellos */
    const sellPiece = (piece: StrategyPiece) => {
        const parts = splitPrice(priceOf(piece), piece.products.map(product => product.price))
        setSharing(null)
        setSelling({ preset: { note: piece.title, lines: piece.products.map((product, index) => ({ sku: product.sku, quantity: 1, unitPrice: parts[index] })) } })
    }

    const copy = async (text: string) => {
        try { await navigator.clipboard.writeText(text); toast.success('Mensaje copiado.') } catch { toast.error('No se pudo copiar.') }
    }

    const lastOrder = data?.inventory.last_order
    const summary = data?.inventory.summary

    return (
        <div className="flex flex-col gap-4 pt-2">
            <PageHead
                eyebrow={data ? `Tu estrategia de ${data.month}` : 'Tu estrategia'}
                title={data ? <Headline text={data.headline} focus={data.focus?.label ?? null} /> : <>Tu <em>estrategia</em></>}
                sub={data && data.segment !== 'empty' ? `La armé con ${lastOrder ? `tu pedido del ${dayLabel(lastOrder.date)}` : 'tu inventario'}: qué mover primero, cuánto ganas y las piezas para tus clientas.` : undefined}
            >
                <Link to={APP_ROUTES.INVENTORY} className="flex h-11 items-center gap-2 rounded-full border border-border bg-card px-4 text-[13.5px] font-semibold hover:border-[#6C47FF]/40">
                    <BoxIcon className="size-4 text-[#6C47FF]" /> Tu inventario
                </Link>
                {data && <SellButton onClick={() => setSelling({ preset: null })} />}
            </PageHead>

            {isLoading ? (
                <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
                    <div className="grid gap-4"><div className="hoy-skel h-40 rounded-3xl" /><div className="hoy-skel h-[380px] rounded-3xl" /></div>
                    <div className="hoy-skel h-[300px] rounded-3xl" />
                </div>
            ) : error || !data ? (
                <Card className="py-10 text-center">
                    <p className="text-[15px] font-extrabold">No pudimos armar tu estrategia</p>
                    <p className="mt-1 text-[13px] text-muted-foreground">{friendlyError(error, 'Revisa tu conexión e intenta de nuevo.')}</p>
                    <button type="button" onClick={() => refetch()} className="hoy-cta mt-4 h-11 cursor-pointer rounded-full px-6 text-[13.5px] font-bold text-white">Intentar de nuevo</button>
                </Card>
            ) : (
                <>
                <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
                    <div className="grid grid-cols-1 gap-4">
                        <Card className="hoy-edge">
                            <div className="flex flex-wrap gap-1.5">
                                {data.focus && <Chip tone="magenta">Enfoque: {data.focus.label}</Chip>}
                                {data.moment && <Chip tone="violet">{data.moment.label} · {data.moment.dates}</Chip>}
                                {summary && summary.stale > 0 && <Chip tone="amber">{summary.stale} para mover primero</Chip>}
                            </div>
                            <p className="mt-3 text-[18px] leading-[1.4] font-semibold tracking-tight [text-wrap:pretty]">{data.diagnosis}</p>
                        </Card>

                        <Card title="Tu plan de la semana" aside={data.plan.length ? <small className="text-[11.5px] font-semibold text-muted-foreground">{done.length} de {data.plan.length}</small> : undefined}>
                            <ol className="mt-2 grid gap-1">
                                {data.plan.map((step, index) => {
                                    const checked = done.includes(index)
                                    const piece = step.piece ? byKey.get(step.piece) : undefined
                                    return (
                                        <li key={index} className="flex items-start gap-3 rounded-2xl px-1 py-2">
                                            <button type="button" role="checkbox" aria-checked={checked} aria-label={`Paso ${index + 1} hecho`} onClick={() => toggle(index)}
                                                className={cn('mt-0.5 grid size-6 shrink-0 cursor-pointer place-items-center rounded-full border-2 transition-colors', checked ? 'border-transparent bg-[linear-gradient(135deg,#E5077D,#6C47FF)] text-white' : 'border-[#6C47FF]/40 hover:border-[#6C47FF]')}>
                                                {checked && <CheckIcon className="size-3.5" strokeWidth={3} />}
                                            </button>
                                            <span className={cn('min-w-0 flex-1 text-[14px] leading-snug', checked && 'text-muted-foreground line-through decoration-[#6C47FF]/50')}>
                                                {step.text}
                                                {piece && (
                                                    <button type="button" onClick={() => setSharing(piece)} className="ml-1.5 cursor-pointer text-[13px] font-bold text-[#6C47FF] no-underline hover:underline dark:text-[#A894FF]">Ver la pieza</button>
                                                )}
                                            </span>
                                        </li>
                                    )
                                })}
                            </ol>
                        </Card>

                    </div>

                    <div className="grid grid-cols-1 gap-4 xl:sticky xl:top-[90px]">
                        <LevelCard level={data.level} month={data.month} />
                        {summary && (
                            <Card title="Tu inventario" aside={!data.inventory.reviewed && summary.products > 0 ? <Chip tone="magenta">Revísalo una vez</Chip> : undefined}>
                                {summary.products > 0 ? (
                                    <div className="mt-3 grid grid-cols-2 gap-2">
                                        <Figure label="Tienes guardado" value={money(summary.catalog_value)} />
                                        <Figure label="Te costó" value={money(summary.cost)} />
                                        <Figure label="Tu ganancia al venderlo" value={money(summary.profit)} win wide />
                                    </div>
                                ) : (
                                    <p className="mt-2 text-[13px] text-muted-foreground">Todavía no vemos productos en tu inventario.</p>
                                )}
                                <Link to={APP_ROUTES.INVENTORY} className="mt-3 flex h-10 items-center justify-center rounded-full border border-border text-[13px] font-semibold hover:border-[#6C47FF]/40">
                                    {summary.products > 0 ? `Ver mis ${summary.products} productos` : 'Agregar lo que tengo'}
                                </Link>
                            </Card>
                        )}
                    </div>
                </div>

                    {data.pieces.length > 0 && (
                        <section className="@container">
                            <div className="mb-2.5 flex items-baseline justify-between gap-2 px-1">
                                <h2 className="text-[16px] font-extrabold tracking-tight">Para tus clientas</h2>
                                <small className="hidden text-[12px] text-muted-foreground sm:inline">Con tu nombre · bocetos: las finales llevan la foto del producto</small>
                            </div>
                            <div className="grid grid-cols-1 gap-4 @xl:grid-cols-2 @4xl:grid-cols-3">
                                {data.pieces.map(piece => <PieceCard key={piece.key} piece={piece} price={priceOf(piece)} onShare={() => setSharing(piece)} />)}
                            </div>
                        </section>
                    )}

                    {data.reminders.length > 0 && (
                        <Card title="Vuelve a ofrecerles" aside={<small className="text-[11.5px] font-semibold text-muted-foreground">ya les toca</small>}>
                            <div className="mt-1">
                                {data.reminders.map(reminder => (
                                    <div key={`${reminder.client_customer_id ?? reminder.customer_name}-${reminder.sold_at}`} className="flex flex-wrap items-center gap-3 border-b border-border py-3 last:border-b-0">
                                        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#6C47FF]/10 text-[13px] font-extrabold text-[#4E31C0] dark:text-[#BBAAFF]">
                                            {titleCaseName(reminder.customer_name).split(' ').slice(0, 2).map(part => part.charAt(0)).join('')}
                                        </span>
                                        <span className="min-w-[200px] flex-1">
                                            <b className="block text-[14px] font-bold">{titleCaseName(reminder.customer_name)}</b>
                                            <small className="block text-[12.5px] text-muted-foreground">Le vendiste {reminder.product} hace {reminder.weeks} semanas: ya se le debe estar acabando.</small>
                                        </span>
                                        <span className="flex gap-1.5">
                                            <button type="button" onClick={() => copy(reminder.message)} className="flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-border px-3 text-[12.5px] font-semibold hover:border-[#6C47FF]/40">
                                                <CopyIcon className="size-3.5" /> Copiar mensaje
                                            </button>
                                            <a href={`https://wa.me/?text=${encodeURIComponent(reminder.message)}`} target="_blank" rel="noreferrer" className="flex h-9 items-center gap-1.5 rounded-full bg-[#25D366]/12 px-3 text-[12.5px] font-bold text-[#0b7a5c] hover:bg-[#25D366]/20 dark:text-[#5BE39A]">
                                                <MessageCircleIcon className="size-3.5" /> WhatsApp
                                            </a>
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}
                </>
            )}

            <ShareDialog
                piece={sharing}
                level={data?.level.level ?? 0}
                price={sharing ? priceOf(sharing) : 0}
                onPriceChange={price => sharing && setPrices(current => ({ ...current, [sharing.key]: price }))}
                onClose={() => setSharing(null)}
                onSold={() => sharing && sellPiece(sharing)}
            />
            <SaleDialog open={!!selling} onClose={() => setSelling(null)} preset={selling?.preset ?? null} />
        </div>
    )
}

export default EstrategiaPage
