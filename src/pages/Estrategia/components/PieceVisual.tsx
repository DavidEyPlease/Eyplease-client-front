import { useRef, useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'

import { StrategyPiece } from '@/interfaces/strategy'
import useSlideImages from '@/hooks/useSlideImages'
import { cn } from '@/lib/utils'
import PieceBoceto from './PieceBoceto'

const ARROW = 'absolute top-1/2 z-[2] grid size-8 -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-black/45 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 disabled:hidden'

/**
 * Lo que se ve de una pieza: sus láminas reales (la de su producto; el dúo, la portada y cada producto, para deslizar)
 * con el logo de ella, o el boceto mientras ese producto no tenga imagen de Astra. Siempre 9:16, como se comparte.
 */
const PieceVisual = ({ piece, price, className }: { piece: StrategyPiece, price: number, className?: string }) => {
    const { images, loading, failed } = useSlideImages(piece.slides)
    const [index, setIndex] = useState(0)
    const track = useRef<HTMLDivElement>(null)

    if (!piece.slides?.length || failed) return <PieceBoceto piece={piece} price={price} className={cn('aspect-[9/16]', className)} />

    const go = (to: number, event: React.MouseEvent) => {
        event.stopPropagation()
        const el = track.current
        if (el) el.scrollTo({ left: to * el.clientWidth, behavior: 'smooth' })
    }

    return (
        <div className={cn('group relative aspect-[9/16] overflow-hidden rounded-[20px] bg-foreground/5', className)}>
            <div
                ref={track}
                onScroll={event => setIndex(Math.round(event.currentTarget.scrollLeft / Math.max(1, event.currentTarget.clientWidth)))}
                className="flex h-full snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
                {images.map((image, position) => (
                    <div key={image.key} className="relative h-full w-full shrink-0 snap-center">
                        {image.src
                            ? <img src={image.src} alt={`${piece.title} · ${position + 1} de ${images.length}`} className="size-full object-cover" draggable={false} />
                            : <div className="hoy-skel size-full" />}
                    </div>
                ))}
            </div>
            {images.length > 1 && (
                <>
                    <button type="button" aria-label="Lámina anterior" disabled={index === 0} onClick={event => go(index - 1, event)} className={cn(ARROW, 'left-2')}><ChevronLeftIcon className="size-4" /></button>
                    <button type="button" aria-label="Lámina siguiente" disabled={index >= images.length - 1} onClick={event => go(index + 1, event)} className={cn(ARROW, 'right-2')}><ChevronRightIcon className="size-4" /></button>
                    <span className="absolute inset-x-0 bottom-2.5 z-[2] flex justify-center gap-1.5" aria-hidden>
                        {images.map((image, position) => <i key={image.key} className={cn('block h-1.5 rounded-full bg-white/70 transition-all', position === index ? 'w-4 bg-white' : 'w-1.5')} />)}
                    </span>
                    <span className="absolute top-2.5 right-2.5 z-[2] rounded-full bg-black/45 px-2 py-0.5 text-[10.5px] font-bold text-white backdrop-blur-sm">{index + 1} / {images.length}</span>
                </>
            )}
            {loading && <span className="sr-only">Cargando la pieza…</span>}
        </div>
    )
}

export default PieceVisual
