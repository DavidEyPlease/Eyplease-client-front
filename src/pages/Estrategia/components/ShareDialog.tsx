import { useEffect, useState } from 'react'
import { CopyIcon, MessageCircleIcon } from 'lucide-react'
import { toast } from 'sonner'

import { StrategyPiece } from '@/interfaces/strategy'
import { cn } from '@/lib/utils'
import { money, parseAmount } from '../format'
import usePieceCost from '../usePieceCost'
import Field from './Field'
import Panel from './Panel'
import PieceBoceto from './PieceBoceto'

/** El mensaje con el precio nuevo: cambia el primer «$749» por el que ella puso. */
const withPrice = (message: string, from: number, to: number) => from === to ? message : message.replace(money(from), money(to))

interface Props {
    piece: StrategyPiece | null
    /** Su nivel de descuento: al 35 % cada descuento sale de su bolsa */
    level: number
    price: number
    onPriceChange: (price: number) => void
    onClose: () => void
    /** «Ya me compró» con esta pieza y este precio */
    onSold: () => void
}

/**
 * Compartir una pieza con sus clientas: el precio lo pone ella (dice cuánto gana o si pierde), el mensaje se copia o
 * se abre en WhatsApp, y si ya le compraron, «Ya me compró» la anota con esos productos y ese precio.
 */
const ShareDialog = ({ piece, level, price, onPriceChange, onClose, onSold }: Props) => {
    const cost = usePieceCost(piece)
    const [text, setText] = useState('')
    const [message, setMessage] = useState('')

    // Al abrir: su precio y el mensaje con ese precio
    const pieceKey = piece?.key ?? null
    useEffect(() => {
        if (!piece) return
        setText(String(price))
        setMessage(withPrice(piece.message, piece.promo_price ?? piece.normal_price, price))
        // eslint-disable-next-line react-hooks/exhaustive-deps -- sólo al abrir otra pieza; después manda lo que ella escribe
    }, [pieceKey])

    if (!piece) return null

    const typed = parseAmount(text) ?? 0
    const gain = cost !== null ? typed - cost : null
    const discounted = typed < piece.normal_price
    const thin = level > 0 && level < 40 && discounted

    const changePrice = (value: string) => {
        setText(value)
        const next = parseAmount(value)
        if (next === null || next <= 0) return
        setMessage(current => withPrice(current, price, next))
        onPriceChange(next)
    }

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(message)
            toast.success('Mensaje copiado. Pégalo en WhatsApp junto con la pieza.')
        } catch {
            toast.error('No se pudo copiar. Selecciona el texto y cópialo a mano.')
        }
    }

    return (
        <Panel
            open={!!piece}
            onClose={onClose}
            title="Compartir con tus clientas"
            description={piece.title}
            className="sm:max-w-[720px]"
            footer={
                <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
                    <button type="button" onClick={copy} className="hoy-cta flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full px-5 text-[14.5px] font-bold text-white">
                        <CopyIcon className="size-4" /> Copiar mensaje
                    </button>
                    <a href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noreferrer" className="flex h-12 items-center justify-center gap-2 rounded-full bg-[#25D366]/12 px-5 text-[14px] font-bold text-[#0b7a5c] hover:bg-[#25D366]/20 dark:text-[#5BE39A]">
                        <MessageCircleIcon className="size-4" /> Abrir WhatsApp
                    </a>
                    <button type="button" onClick={onSold} className="flex h-12 cursor-pointer items-center justify-center rounded-full border border-border px-5 text-[14px] font-bold text-[#4E31C0] hover:border-[#6C47FF]/40 dark:text-[#BBAAFF]">
                        Ya me compró
                    </button>
                </div>
            }
        >
            <div className="grid gap-5 sm:grid-cols-[250px_minmax(0,1fr)]">
                <div>
                    <PieceBoceto piece={piece} price={typed > 0 ? typed : price} />
                    <p className="mt-2 text-center text-[11.5px] text-muted-foreground">Boceto: la pieza final lleva la foto real del producto.</p>
                </div>
                <div className="grid content-start gap-3">
                    <Field label={piece.promo_price ? 'Tu precio de promoción' : 'Tu precio'} value={text} onChange={changePrice} inputMode="decimal" prefix="$" />
                    <p className={cn('rounded-2xl px-3.5 py-2.5 text-[13.5px] font-semibold', gain !== null && gain < 0 ? 'bg-[#E5484D]/10 text-[#C9373C] dark:text-[#FF8A8E]' : thin ? 'bg-amber-400/15 text-amber-800 dark:text-amber-200' : 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-200')}>
                        {gain === null ? <span className="font-medium">Todavía no tengo la factura de este producto: no sé cuánto te costó.</span>
                            : gain < 0 ? <>Pierdes <b>{money(-gain)}</b> con ese precio.</>
                                : thin ? <>Ganas sólo <b>{money(gain)}</b>. Al {level} % cada descuento sale de tu ganancia: conviene no descontar.</>
                                    : <>Ganas <b>{money(gain)}</b> en cada venta.</>}
                    </p>
                    <p className="text-[12px] leading-snug text-muted-foreground">
                        Normal: {money(piece.normal_price)}.{' '}
                        {piece.promo_price ? `Te sugiero ${money(piece.promo_price)}: el descuento lo pones tú y sale de tu ganancia.` : 'Sin descuento: así ganas más.'}
                    </p>
                    <label className="block">
                        <small className="mb-1 block text-[10.5px] font-bold tracking-wider text-muted-foreground uppercase">El mensaje</small>
                        <textarea value={message} onChange={event => setMessage(event.target.value)} rows={5}
                            className="w-full resize-none rounded-[14px] border-[1.5px] border-border bg-card px-3 py-2.5 text-[13.5px] leading-snug outline-none focus:border-[#6C47FF] focus:shadow-[0_0_0_3px_rgba(108,71,255,0.15)]" />
                    </label>
                </div>
            </div>
        </Panel>
    )
}

export default ShareDialog
