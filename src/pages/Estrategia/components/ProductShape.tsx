import { useId } from 'react'

import { cn } from '@/lib/utils'

type Shape = 'perfume' | 'tube' | 'stick' | 'bottle' | 'jar'

/** La silueta sale del nombre: no tenemos foto de cada producto (eso llega con las piezas de la parte 4). */
const shapeOf = (name: string): Shape => {
    const text = name.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    if (/cc cream|protector|crema para manos|tubo|gel limpiador|exfoliante|mascarilla/.test(text)) return 'tube'
    if (/perfum|parfum|toilette|cologne|colonia|scent/.test(text)) return 'perfume'
    if (/labial|lapiz|delineador|sombra.*barra|barra|mascara|rimel|brillo/.test(text)) return 'stick'
    if (/base|locion|tonico|agua|desmaquillante|suero|serum|micelar/.test(text)) return 'bottle'
    return 'jar'
}

const PATHS: Record<Shape, React.ReactElement> = {
    perfume: <><rect x="9" y="3" width="6" height="4" rx="1" /><rect x="5" y="8" width="14" height="13" rx="4" /></>,
    tube: <><rect x="8" y="2.5" width="8" height="4" rx="1" /><path d="M7 7h10l-1.2 13.5a1.6 1.6 0 0 1-1.6 1.5H9.8a1.6 1.6 0 0 1-1.6-1.5z" /></>,
    stick: <><rect x="9" y="2.5" width="6" height="7" rx="2.5" /><rect x="7.5" y="10" width="9" height="11.5" rx="1.6" /></>,
    bottle: <><rect x="9.5" y="2.5" width="5" height="4" rx="1" /><rect x="6.5" y="7" width="11" height="14.5" rx="2.6" /></>,
    jar: <><rect x="5" y="5" width="14" height="4" rx="1.4" /><rect x="4" y="9.5" width="16" height="11" rx="3" /></>,
}

const ProductShape = ({ name, className }: { name: string, className?: string }) => {
    const gradient = `producto${useId().replace(/:/g, '')}`
    return (
        <span className={cn('grid size-10 shrink-0 place-items-center rounded-xl bg-[linear-gradient(135deg,#FCE7F3,#EDE9FE)] dark:bg-[linear-gradient(135deg,rgba(229,7,125,.18),rgba(108,71,255,.22))]', className)} aria-hidden>
            <svg viewBox="0 0 24 24" className="size-5" fill={`url(#${gradient})`}>
                <defs>
                    <linearGradient id={gradient} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0" stopColor="#E5077D" />
                        <stop offset="1" stopColor="#6C47FF" />
                    </linearGradient>
                </defs>
                {PATHS[shapeOf(name)]}
            </svg>
        </span>
    )
}

export default ProductShape
