import { useEffect, useState } from 'react'
import { CopyIcon, ImagesIcon, Loader2Icon, MessageCircleIcon } from 'lucide-react'
import { toast } from 'sonner'

import useSlideImages from '@/hooks/useSlideImages'
import { InventoryItem } from '@/interfaces/inventory'
import { money, pieces } from '../format'
import shareSlides from '../shareSlides'
import { IOS_SHARE_HINT, messageGoesSeparate } from '@/lib/share'
import Panel from './Panel'

interface Props {
    /** El producto con su `piece` (su imagen con el logo de ella y el mensaje); nulo = cerrada */
    item: InventoryItem | null
    onClose: () => void
    /** «Ya me compró» con este producto */
    onSold: (item: InventoryItem) => void
}

/**
 * «Compartir» un producto de su inventario: su imagen de la biblioteca (con su logo) y el mensaje «Lo tengo para
 * entrega inmediata…», que ella edita. Se manda igual que las piezas de su estrategia: con la hoja de compartir del
 * teléfono o, si el navegador no puede, se baja la imagen y se copia el mensaje.
 */
const ItemShareDialog = ({ item, onClose, onSold }: Props) => {
    const piece = item?.piece ?? null
    const slides = useSlideImages(piece?.slides, !!piece)
    const [message, setMessage] = useState('')
    const [sending, setSending] = useState(false)

    const sku = item?.sku ?? null
    useEffect(() => {
        setMessage(piece?.message ?? '')
        // eslint-disable-next-line react-hooks/exhaustive-deps -- sólo al abrir otro producto; después manda lo que ella escribe
    }, [sku])

    if (!item || !piece) return null

    const count = piece.slides.length
    const withImages = count > 0 && !slides.failed
    const images = count === 1 ? 'la imagen' : `las ${count} imágenes`

    const send = async (mode: 'share' | 'download' = 'share') => {
        if (!slides.ready) return
        setSending(true)
        try {
            const outcome = await shareSlides(slides.images, message, item.name, mode)
            if (outcome === 'downloaded') toast.success(`Bajé ${images} y copié el mensaje: mándalos juntos por WhatsApp.`)
        } finally {
            setSending(false)
        }
    }

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(message)
            toast.success('Mensaje copiado. Pégalo en WhatsApp junto con la imagen.')
        } catch {
            toast.error('No se pudo copiar. Selecciona el texto y cópialo a mano.')
        }
    }

    return (
        <Panel
            open
            onClose={onClose}
            title="Compartir con tus clientas"
            description={[item.name, item.shade].filter(Boolean).join(' · ')}
            className="sm:max-w-[680px]"
            footer={
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-[1fr_auto_auto]">
                    {withImages ? (
                        <>
                            <button type="button" onClick={() => send()} disabled={!slides.ready || sending} className="hoy-cta col-span-2 flex h-12 sm:col-span-1 cursor-pointer items-center justify-center gap-2 rounded-full px-5 text-[14.5px] font-bold text-white disabled:cursor-default disabled:opacity-60">
                                {!slides.ready || sending ? <Loader2Icon className="size-4 animate-spin" /> : <ImagesIcon className="size-4" />}
                                {slides.ready ? `Compartir ${images} y el mensaje` : 'Preparando la imagen…'}
                            </button>
                            {messageGoesSeparate(withImages) && <p className="text-[12px] leading-snug text-muted-foreground col-span-2 sm:order-last sm:col-span-3">{IOS_SHARE_HINT}</p>}
                        </>
                    ) : (
                        <a href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noreferrer" className="col-span-2 flex h-12 sm:col-span-1 items-center justify-center gap-2 rounded-full bg-[#25D366]/12 px-5 text-[14px] font-bold text-[#0b7a5c] hover:bg-[#25D366]/20 dark:text-[#5BE39A]">
                            <MessageCircleIcon className="size-4" /> Abrir WhatsApp con el mensaje
                        </a>
                    )}
                    <button type="button" onClick={copy} className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full border border-border px-4 text-[14px] font-bold hover:border-[#6C47FF]/40 sm:px-5">
                        <CopyIcon className="size-4" /> Copiar<span className="hidden sm:inline"> mensaje</span>
                    </button>
                    <button type="button" onClick={() => onSold(item)} className="flex h-12 cursor-pointer items-center justify-center rounded-full border border-border px-4 text-[14px] font-bold text-[#4E31C0] hover:border-[#6C47FF]/40 sm:px-5 dark:text-[#BBAAFF]">
                        Ya me compró
                    </button>
                </div>
            }
        >
            <div className="grid gap-5 sm:grid-cols-[220px_minmax(0,1fr)]">
                <div>
                    {/* Como la verá su clienta en WhatsApp (vertical); con varias, se desliza */}
                    <div className="-mx-1 flex snap-x gap-2.5 overflow-x-auto px-1 pb-1">
                        {piece.slides.map((slide, index) => {
                            const src = slides.images[index]?.src
                            return (
                                <div key={slide.key} className="mx-auto aspect-[9/16] w-[min(46%,190px)] shrink-0 snap-start overflow-hidden rounded-2xl border border-border bg-foreground/[0.04] sm:w-full">
                                    {src ? <img src={src} alt={`${item.name}, imagen ${index + 1}`} className="size-full object-cover" /> : <div className="hoy-skel size-full" />}
                                </div>
                            )
                        })}
                    </div>
                    {withImages && slides.ready && (
                        <button type="button" onClick={() => send('download')} className="mt-2 w-full cursor-pointer text-center text-[12px] font-semibold text-[#6C47FF] hover:underline dark:text-[#A894FF]">
                            Bajar {images} y copiar el mensaje (WhatsApp Web)
                        </button>
                    )}
                    <p className="mt-1.5 text-center text-[11.5px] text-muted-foreground">
                        {slides.failed ? 'No pude preparar la imagen ahora: manda el mensaje y vuelve a intentarlo.' : 'Con tu logo. El precio va en el mensaje.'}
                    </p>
                </div>
                <div className="grid content-start gap-3">
                    <p className="rounded-2xl bg-foreground/[0.04] px-3.5 py-2.5 text-[13px] leading-snug">
                        Te {item.on_hand === 1 ? 'queda' : 'quedan'} <b>{pieces(item.on_hand)}</b>
                        {item.price > 0 && <> · a <b>{money(item.price)}</b> c/u</>}
                        {item.profit_per_unit !== null && item.profit_per_unit > 0 && <> · ganas <b>{money(item.profit_per_unit)}</b> en cada una</>}
                    </p>
                    <label className="block">
                        <small className="mb-1 block text-[10.5px] font-bold tracking-wider text-muted-foreground uppercase">El mensaje</small>
                        <textarea value={message} onChange={event => setMessage(event.target.value)} rows={4}
                            className="w-full resize-none rounded-[14px] border-[1.5px] border-border bg-card px-3 py-2.5 text-[13.5px] leading-snug outline-none focus:border-[#6C47FF] focus:shadow-[0_0_0_3px_rgba(108,71,255,0.15)]" />
                    </label>
                    <p className="text-[12px] leading-snug text-muted-foreground">Cámbialo como quieras: tu precio, un descuento o el nombre de tu clienta.</p>
                </div>
            </div>
        </Panel>
    )
}

export default ItemShareDialog
