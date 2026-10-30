import { LockIcon, SparklesIcon } from 'lucide-react'

import { GiftPreview } from '@/interfaces/invitations'

const fecha = (iso: string | null) => {
    if (!iso) return null
    const [y, m, d] = iso.slice(0, 10).split('-').map(Number)
    return new Date(y, m - 1, d).toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })
}

/**
 * Su estrategia del mes, ya armada con sus pedidos, pero borrosa y sin montos hasta que active su regalo: se leen las
 * etiquetas y los productos (para que vea que es SUYA); las imágenes y los mensajes, no.
 */
const GiftPreviewCard = ({ preview }: { preview: GiftPreview }) => {
    const ultimo = fecha(preview.last_order)

    if (!preview.ready || !preview.pieces.length) {
        return (
            <section className="relative overflow-hidden rounded-[22px] border bg-card p-5 shadow-card">
                <p className="text-[11px] font-extrabold tracking-[.14em] text-[#6C47FF] uppercase dark:text-[#A894FF]">Tu estrategia de {preview.month}</p>
                <p className="mt-2 text-[15px] leading-snug font-bold">En cuanto llegue tu próximo pedido, aquí te digo qué ofrecer y te doy las imágenes con tu nombre.</p>
                <div aria-hidden className="mt-4 grid gap-2.5 blur-[5px] select-none">
                    {['Para entrega inmediata', 'Dúo del mes', 'Disponible'].map(tag => (
                        <div key={tag} className="flex items-center gap-3 rounded-2xl bg-muted/70 p-3">
                            <span className="size-14 shrink-0 rounded-xl bg-[linear-gradient(135deg,#E5077D55,#6C47FF55)]" />
                            <span className="grid flex-1 gap-1.5"><span className="h-3 w-2/3 rounded bg-foreground/20" /><span className="h-3 w-1/2 rounded bg-foreground/10" /></span>
                        </div>
                    ))}
                </div>
                <Candado texto="Se abre al activar tu regalo" />
            </section>
        )
    }

    return (
        <section className="relative overflow-hidden rounded-[22px] border bg-card p-5 shadow-card">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-[11px] font-extrabold tracking-[.14em] text-[#6C47FF] uppercase dark:text-[#A894FF]">Tu estrategia de {preview.month}</p>
                    {preview.headline && <p className="mt-1 text-[18px] leading-tight font-extrabold tracking-tight">{preview.headline}</p>}
                </div>
                <SparklesIcon className="mt-0.5 size-5 shrink-0 text-[#E5077D]" />
            </div>
            <p className="mt-1.5 text-[12.5px] text-muted-foreground">
                Armada con tus pedidos de Mary Kay{ultimo ? ` (el último, del ${ultimo})` : ''}
                {preview.products > 0 ? ` · ${preview.products} ${preview.products === 1 ? 'producto' : 'productos'} en tu inventario` : ''}.
            </p>
            {(preview.focus || preview.moment) && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                    {preview.focus && <span className="inline-flex h-6 items-center rounded-full bg-[#6C47FF]/10 px-2.5 text-[11.5px] font-bold text-[#4E31C0] first-letter:uppercase dark:text-[#C9BDFF]">Enfoque: {preview.focus}</span>}
                    {preview.moment && <span className="inline-flex h-6 items-center rounded-full bg-[#E5077D]/10 px-2.5 text-[11.5px] font-bold text-[#C0066A] dark:text-[#FF7AC0]">{preview.moment.label} · {preview.moment.dates}</span>}
                </div>
            )}

            <ol className="mt-4 grid gap-2.5">
                {preview.pieces.map(piece => (
                    <li key={piece.key} className="flex items-center gap-3 rounded-2xl bg-muted/60 p-2.5">
                        <span className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-[linear-gradient(135deg,#E5077D33,#6C47FF33)]">
                            {piece.image_url && <img src={piece.image_url} alt="" loading="lazy" className="size-full scale-110 object-cover blur-[6px]" />}
                        </span>
                        <span className="min-w-0 flex-1">
                            <span className="block text-[10.5px] font-extrabold tracking-wide text-[#C0066A] uppercase dark:text-[#FF7AC0]">{piece.tag}</span>
                            <span className="mt-0.5 line-clamp-2 block text-[13.5px] leading-snug font-bold">{piece.products.join(' + ')}</span>
                            <span aria-hidden className="mt-1.5 flex gap-1.5 blur-[3px] select-none"><span className="h-2.5 w-20 rounded bg-foreground/20" /><span className="h-2.5 w-12 rounded bg-foreground/15" /></span>
                        </span>
                    </li>
                ))}
            </ol>
            <Candado texto="Tus mensajes, tus imágenes y cuánto ganas se abren al activar tu regalo" chico />
        </section>
    )
}

const Candado = ({ texto, chico = false }: { texto: string, chico?: boolean }) => (
    <p className={chico
        ? 'mt-3 flex items-center gap-2 text-[12px] leading-snug font-semibold text-muted-foreground'
        : 'absolute inset-x-5 bottom-5 flex items-center justify-center gap-2 rounded-full bg-background/90 px-4 py-2 text-[12.5px] font-bold shadow-sm'}>
        <LockIcon className="size-3.5 shrink-0" /> {texto}
    </p>
)

export default GiftPreviewCard
