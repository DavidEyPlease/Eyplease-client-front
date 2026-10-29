import { useEffect, useState } from 'react'
import { CheckIcon, CopyIcon, ImagesIcon, Loader2Icon, MessageCircleIcon } from 'lucide-react'
import { toast } from 'sonner'

import { CustomerSale } from '@/interfaces/inventory'
import useSlideImages from '@/hooks/useSlideImages'
import { titleCaseName } from '@/pages/Hoy/lib'
import shareSlides from '../shareSlides'
import Panel from './Panel'

interface Props {
    /** La venta con su `howto` (las láminas de cómo usar lo que compró y el mensaje); nula = cerrada */
    sale: CustomerSale | null
    /** Recién anotada: el «Listo: anotado…» va arriba, en lugar del aviso de siempre */
    notice?: string | null
    onClose: () => void
}

/**
 * «Mándale cómo usarlo»: lo que la consultora le manda a su clienta DESPUÉS de venderle, para que use bien lo que se
 * llevó. Las láminas (con su logo) y el mensaje los arma la API por cada venta; ella edita el mensaje y lo comparte
 * igual que las piezas de su estrategia (con imágenes; si el navegador no puede, se bajan y se copia el mensaje).
 */
const HowToDialog = ({ sale, notice = null, onClose }: Props) => {
    const howto = sale?.howto ?? null
    const slides = useSlideImages(howto?.slides, !!howto)
    const [message, setMessage] = useState('')
    const [sending, setSending] = useState(false)

    const saleId = sale?.id ?? null
    useEffect(() => {
        setMessage(howto?.message ?? '')
        // eslint-disable-next-line react-hooks/exhaustive-deps -- sólo al abrir otra venta; después manda lo que ella escribe
    }, [saleId])

    if (!sale || !howto) return null

    const count = howto.slides.length
    const withImages = count > 0 && !slides.failed
    const first = titleCaseName(sale.customer_name).split(' ')[0]
    const title = `como-usarlo-${first}`

    const send = async (mode: 'share' | 'download' = 'share') => {
        if (!slides.ready) return
        setSending(true)
        try {
            const outcome = await shareSlides(slides.images, message, title, mode)
            if (outcome === 'downloaded') {
                toast.success(`Bajé ${count === 1 ? 'la imagen' : `las ${count} imágenes`} y copié el mensaje: mándalos juntos por WhatsApp.`)
            }
        } finally {
            setSending(false)
        }
    }

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(message)
            toast.success('Mensaje copiado. Pégalo en WhatsApp junto con las imágenes.')
        } catch {
            toast.error('No se pudo copiar. Selecciona el texto y cópialo a mano.')
        }
    }

    return (
        <Panel
            open
            onClose={onClose}
            title="Mándale cómo usarlo"
            description={`Para que ${first} le saque todo el provecho a lo que se llevó. Con tu logo.`}
            className="sm:max-w-[640px]"
            footer={
                <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                    {withImages ? (
                        <button type="button" onClick={() => send()} disabled={!slides.ready || sending} className="hoy-cta flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full px-5 text-[14.5px] font-bold text-white disabled:cursor-default disabled:opacity-60">
                            {!slides.ready || sending ? <Loader2Icon className="size-4 animate-spin" /> : <ImagesIcon className="size-4" />}
                            {slides.ready ? `Compartir ${count === 1 ? 'la imagen' : `las ${count} imágenes`} y el mensaje` : 'Preparando las imágenes…'}
                        </button>
                    ) : (
                        <a href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noreferrer" className="flex h-12 items-center justify-center gap-2 rounded-full bg-[#25D366]/12 px-5 text-[14px] font-bold text-[#0b7a5c] hover:bg-[#25D366]/20 dark:text-[#5BE39A]">
                            <MessageCircleIcon className="size-4" /> Abrir WhatsApp con el mensaje
                        </a>
                    )}
                    <button type="button" onClick={copy} className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full border border-border px-5 text-[14px] font-bold hover:border-[#6C47FF]/40">
                        <CopyIcon className="size-4" /> Copiar mensaje
                    </button>
                    <button type="button" onClick={onClose} className="cursor-pointer pt-1 text-center text-[13px] font-semibold text-muted-foreground hover:text-foreground sm:col-span-2">
                        {notice ? 'Ahora no' : 'Cerrar'}
                    </button>
                </div>
            }
        >
            {notice && (
                <p className="mb-4 flex items-start gap-2 rounded-2xl bg-emerald-500/10 px-3.5 py-2.5 text-[13px] leading-snug font-semibold text-emerald-800 dark:text-emerald-200">
                    <CheckIcon className="mt-0.5 size-4 shrink-0" /> {notice}
                </p>
            )}

            {/* Las láminas, como las verá ella en WhatsApp (verticales); con varias, se desliza */}
            <div className="-mx-1 flex snap-x gap-2.5 overflow-x-auto px-1 pb-1">
                {howto.slides.map((slide, index) => {
                    const src = slides.images[index]?.src
                    return (
                        <div key={slide.key} className="aspect-[9/16] w-[min(46%,190px)] shrink-0 snap-start overflow-hidden rounded-2xl border border-border bg-foreground/[0.04]">
                            {src ? <img src={src} alt={`Cómo usarlo, imagen ${index + 1}`} className="size-full object-cover" /> : <div className="hoy-skel size-full" />}
                        </div>
                    )
                })}
            </div>
            {withImages && slides.ready && (
                <button type="button" onClick={() => send('download')} className="mt-2 cursor-pointer text-[12px] font-semibold text-[#6C47FF] hover:underline dark:text-[#A894FF]">
                    Bajar {count === 1 ? 'la imagen' : 'las imágenes'} y copiar el mensaje (WhatsApp Web)
                </button>
            )}
            {slides.failed && <p className="mt-2 text-[12px] text-muted-foreground">No pude preparar las imágenes ahora: manda el mensaje y vuelve a intentarlo desde «Sus compras».</p>}

            <label className="mt-4 block">
                <small className="mb-1 block text-[10.5px] font-bold tracking-wider text-muted-foreground uppercase">El mensaje</small>
                <textarea value={message} onChange={event => setMessage(event.target.value)} rows={4}
                    className="w-full resize-none rounded-[14px] border-[1.5px] border-border bg-card px-3 py-2.5 text-[13.5px] leading-snug outline-none focus:border-[#6C47FF] focus:shadow-[0_0_0_3px_rgba(108,71,255,0.15)]" />
            </label>
        </Panel>
    )
}

export default HowToDialog
