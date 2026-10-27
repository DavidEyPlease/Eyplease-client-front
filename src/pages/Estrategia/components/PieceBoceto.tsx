import { StrategyPiece } from '@/interfaces/strategy'
import { cn } from '@/lib/utils'
import useAuthStore from '@/store/auth'
import { titleCaseName } from '@/pages/Hoy/lib'
import { money } from '../format'

/** Un color por tipo de pieza, para que las tres no se confundan mientras no tengan su arte (parte 4) */
const SKINS: Record<StrategyPiece['key'], string> = {
    ahora: 'bg-[linear-gradient(150deg,#E5077D_0%,#8B2BD9_58%,#6C47FF_100%)]',
    duo: 'bg-[linear-gradient(150deg,#4E31C0_0%,#6C47FF_55%,#2CD4D9_120%)]',
    regalo: 'bg-[linear-gradient(150deg,#B3123D_0%,#E5077D_55%,#F5B544_120%)]',
    tambien: 'bg-[linear-gradient(150deg,#1F1A4D_0%,#4E31C0_60%,#E5077D_130%)]',
}

/** La silueta de un producto, en blanco translúcido sobre el degradado */
const Bottle = ({ tall = false }: { tall?: boolean }) => (
    <span className={cn('relative block rounded-[10px] bg-white/85 shadow-[0_8px_18px_-8px_rgba(0,0,0,.45)]', tall ? 'h-[62px] w-[30px]' : 'h-[50px] w-[34px]')}>
        <i className="absolute -top-2 left-1/2 block h-2.5 w-3 -translate-x-1/2 rounded-t-[4px] bg-white/70" />
    </span>
)

interface Props {
    piece: StrategyPiece
    /** El precio que ella puso (o el sugerido) */
    price: number
    className?: string
}

/**
 * La pieza para sus clientas, como BOCETO: el arte final (la base de Astra con la foto del producto) llega con la
 * parte 4 y lo pone el motor. Aquí va lo que la pieza dice: la etiqueta, el producto, el precio y su firma.
 */
const PieceBoceto = ({ piece, price, className }: Props) => {
    const name = useAuthStore(state => state.user?.name ?? '')
    const firma = titleCaseName(name).split(' ').filter(Boolean)
    const short = [firma[0], firma[1]].filter(Boolean).join(' ')
    const initials = firma.slice(0, 2).map(part => part.charAt(0)).join('')
    const discounted = price < piece.normal_price

    return (
        <div className={cn('relative flex aspect-[4/5] flex-col overflow-hidden rounded-[20px] p-[7%] text-left text-white [container-type:inline-size]', SKINS[piece.key], className)}>
            <span className="pointer-events-none absolute -top-[18%] -right-[22%] size-[70%] rounded-full bg-white/10" aria-hidden />
            <span className="pointer-events-none absolute -bottom-[25%] -left-[20%] size-[60%] rounded-full bg-black/10" aria-hidden />
            <div className="relative flex items-start justify-between gap-2">
                <span className="rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-extrabold tracking-wider uppercase backdrop-blur-sm">{piece.tag}</span>
                <span className="rounded-md border border-white/40 px-1.5 py-0.5 text-[8.5px] font-bold tracking-widest opacity-80">BOCETO</span>
            </div>
            <h4 className="relative mt-[6%] text-[clamp(15px,4.6cqw,22px)] leading-[1.12] font-extrabold tracking-tight [text-wrap:balance]">{piece.title}</h4>
            <div className="relative mt-auto mb-[5%] flex items-end gap-2.5">
                {piece.products.map((product, index) => <Bottle key={product.sku} tall={index % 2 === 1} />)}
            </div>
            <div className="relative flex items-end justify-between gap-2">
                <div className="leading-none">
                    {discounted && <s className="block text-[12px] font-semibold opacity-75">{money(piece.normal_price)}</s>}
                    <b className="block text-[clamp(22px,7cqw,32px)] font-extrabold tracking-tight">{money(price)}</b>
                </div>
                <div className="flex min-w-0 items-center gap-1.5 text-right">
                    <span className="min-w-0 leading-tight">
                        <b className="block truncate text-[11px] font-extrabold">{short || 'Tu nombre'}</b>
                        <small className="block truncate text-[9px] opacity-85">Tu Consultora de Belleza</small>
                    </span>
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-white text-[10px] font-extrabold text-[#4E31C0]">{initials || 'EY'}</span>
                </div>
            </div>
        </div>
    )
}

export default PieceBoceto
