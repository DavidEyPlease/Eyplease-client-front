import { Link } from 'react-router'
import { ArrowRightIcon, LockIcon, SparklesIcon } from 'lucide-react'

import { APP_ROUTES } from '@/constants/app'
import useStrategy from '@/hooks/useStrategy'
import useStandardQuote, { standardPriceLine } from '@/hooks/useStandardQuote'
import { isStrategyLockedError } from '../feature'
import { dayLabel } from '../format'

/** Con plan gratis: lo que trae, cuánto cuesta y «Ver un ejemplo» / «Contratar el Plan Standard» */
const LockedCard = () => {
    const { data: quote } = useStandardQuote()
    const price = standardPriceLine(quote)
    return (
        <section className="hoy-rise relative overflow-hidden rounded-[24px] bg-[linear-gradient(135deg,#E5077D_0%,#9B2FD0_52%,#6C47FF_100%)] p-5 text-white shadow-[0_18px_40px_-22px_rgba(229,7,125,.75)]">
            <span className="pointer-events-none absolute -top-16 -right-12 size-48 rounded-full bg-white/10" aria-hidden />
            <p className="relative flex items-center gap-1.5 text-[10.5px] font-extrabold tracking-[.16em] uppercase opacity-90">
                <LockIcon className="size-3.5" /> Tu estrategia · Plan Standard
            </p>
            <h3 className="relative mt-1.5 text-[24px] leading-[1.1] font-extrabold tracking-tight">Te ayudo a vender lo que compras</h3>
            <p className="relative mt-1.5 max-w-[52ch] text-[13.5px] leading-snug opacity-95">
                Cada mes: qué ofrecer con lo que compraste, cuánto ganas, a quién volver a ofrecerle y las piezas con tu logo, listas para WhatsApp.
            </p>
            {price && <p className="relative mt-1.5 text-[13px] font-extrabold">{price}</p>}
            <div className="relative mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                <Link to={APP_ROUTES.HOME.PLAN_STANDARD} className="flex h-11 items-center gap-2 rounded-full bg-white px-5 text-[14px] font-bold text-[#B5066A] shadow-[0_10px_20px_-12px_rgba(0,0,0,.5)] transition-transform hover:-translate-y-px">
                    Contratar el Plan Standard <ArrowRightIcon className="size-4" />
                </Link>
                <Link to={APP_ROUTES.STRATEGY} className="text-[13px] font-bold underline-offset-4 opacity-95 hover:underline">Ver un ejemplo</Link>
            </div>
        </section>
    )
}

/**
 * La tarjeta de «Tu estrategia» arriba del Hoy de la consultora (como en el prototipo aprobado): el enfoque del mes,
 * con qué pedido se armó y cuántas piezas tiene listas. Con plan gratis, el candado. Detrás del interruptor de `feature.ts`.
 */
const StrategyHoyCard = ({ locked = false }: { locked?: boolean }) => {
    const { data, isLoading, isError, error } = useStrategy(!locked)

    if (locked || isStrategyLockedError(error)) return <LockedCard />
    if (isLoading) return <div className="hoy-skel h-[168px] rounded-[24px]" />
    if (isError) return null

    const empty = !data || data.segment === 'empty'
    const lastOrder = data?.inventory.last_order
    const extras = [
        data?.pieces.length ? `${data.pieces.length} ${data.pieces.length === 1 ? 'pieza lista' : 'piezas listas'}` : null,
        data?.reminders.length ? `${data.reminders.length} ${data.reminders.length === 1 ? 'clienta' : 'clientas'} para volver a ofrecerle${data.reminders.length === 1 ? '' : 's'}` : null,
    ].filter(Boolean)

    return (
        <section className="hoy-rise relative overflow-hidden rounded-[24px] bg-[linear-gradient(135deg,#E5077D_0%,#9B2FD0_52%,#6C47FF_100%)] p-5 text-white shadow-[0_18px_40px_-22px_rgba(229,7,125,.75)]">
            <span className="pointer-events-none absolute -top-16 -right-12 size-48 rounded-full bg-white/10" aria-hidden />
            <span className="pointer-events-none absolute -bottom-20 left-1/3 size-40 rounded-full bg-white/[0.06]" aria-hidden />
            <p className="relative flex items-center gap-1.5 text-[10.5px] font-extrabold tracking-[.16em] uppercase opacity-90">
                <SparklesIcon className="size-3.5" /> {empty ? 'Nuevo · Tu estrategia' : `Tu estrategia de ${data?.month}`}
            </p>
            <h3 className="relative mt-1.5 text-[24px] leading-[1.1] font-extrabold tracking-tight">{empty ? 'Te ayudo a vender lo que compras' : data?.headline}</h3>
            <p className="relative mt-1.5 max-w-[52ch] text-[13.5px] leading-snug opacity-95">
                {empty
                    ? 'Cuando lleguen tus pedidos de Mary Kay te armo qué ofrecer, a quién y con qué piezas. Si tienes producto guardado, agrégalo a tu inventario.'
                    : `La armé con ${lastOrder ? `tu pedido del ${dayLabel(lastOrder.date)}` : 'tu inventario'}: qué mover primero, cuánto ganas y las piezas para tus clientas.`}
            </p>
            <div className="relative mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                <Link to={empty ? APP_ROUTES.INVENTORY : APP_ROUTES.STRATEGY} className="flex h-11 items-center gap-2 rounded-full bg-white px-5 text-[14px] font-bold text-[#B5066A] shadow-[0_10px_20px_-12px_rgba(0,0,0,.5)] transition-transform hover:-translate-y-px">
                    {empty ? 'Ver mi inventario' : 'Ver mi estrategia'} <ArrowRightIcon className="size-4" />
                </Link>
                {extras.length > 0 && <small className="text-[12.5px] font-semibold opacity-90">{extras.join(' · ')}</small>}
            </div>
        </section>
    )
}

export default StrategyHoyCard
