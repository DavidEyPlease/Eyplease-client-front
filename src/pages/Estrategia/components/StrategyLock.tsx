import { Link } from 'react-router'
import { ArrowRightIcon, LockIcon } from 'lucide-react'

import { APP_ROUTES } from '@/constants/app'
import useStandardQuote, { standardPriceLine } from '@/hooks/useStandardQuote'
import { cn } from '@/lib/utils'

interface Props {
    title?: string
    text?: string
    className?: string
}

/**
 * El candado de «Tu estrategia» en los planes gratis: qué trae, cuánto cuesta (con la oferta de lanzamiento si la
 * tiene) y «Contratar el Plan Standard». La API responde PLAN_REQUIRED_STRATEGY y aquí se convierte en esto, no en un error.
 */
const StrategyLock = ({ title = 'Tu estrategia viene con el Plan Standard', text, className }: Props) => {
    const { data: quote } = useStandardQuote()
    const price = standardPriceLine(quote)

    return (
        <section className={cn('hoy-edge relative overflow-hidden rounded-3xl border bg-card px-5 py-5 shadow-card', className)}>
            <div className="flex flex-wrap items-center gap-4">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[linear-gradient(135deg,#E5077D,#6C47FF)] text-white shadow-[0_12px_24px_-12px_rgba(229,7,125,.8)]">
                    <LockIcon className="size-5" />
                </span>
                <div className="min-w-[220px] flex-1">
                    <h2 className="text-[18px] leading-tight font-extrabold tracking-tight">{title}</h2>
                    <p className="mt-1 text-[13.5px] leading-snug text-muted-foreground">
                        {text ?? 'Cada mes te digo qué ofrecer con lo que compraste, cuánto ganas, a quién volver a ofrecerle y te doy las piezas con tu logo, listas para WhatsApp.'}
                    </p>
                    {price && <p className="mt-1.5 text-[13px] font-bold text-[#C0066A] dark:text-[#FF7AC0]">{price}</p>}
                </div>
                <Link to={APP_ROUTES.HOME.PLAN_STANDARD} className="hoy-cta flex h-11 shrink-0 items-center gap-2 rounded-full px-5 text-[14px] font-bold text-white">
                    Contratar el Plan Standard <ArrowRightIcon className="size-4" />
                </Link>
            </div>
        </section>
    )
}

export default StrategyLock
