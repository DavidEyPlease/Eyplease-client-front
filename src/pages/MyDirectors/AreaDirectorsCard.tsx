import { Link } from 'react-router'
import { ChevronRightIcon } from 'lucide-react'

import { APP_ROUTES } from '@/constants/app'
import { cn } from '@/lib/utils'
import RingMeter from '@/pages/Hoy/components/RingMeter'
import { Avatar, TAG } from './components'
import { escalonAlcanzado, haceCuanto, sinEnviarHaceMucho } from './lib'
import useAreaDirectors from './useAreaDirectors'

/** Cuántas Directoras caben en la tarjeta: las que más necesitan acompañamiento. */
const MAX_FILAS = 4

/** «Mis Directoras» en Indicadores (plan Nacional): un vistazo al Área y la entrada a la página. */
const AreaDirectorsCard = ({ style }: { style?: React.CSSProperties }) => {
    const { enabled, loading, data } = useAreaDirectors()
    if (!enabled) return null

    const summary = data?.summary
    const withApp = (data?.directors ?? []).filter(director => director.app)
    const toInvite = (data?.directors ?? []).filter(director => !director.app)

    return (
        <section className="shell-glass hoy-rise rounded-[22px] p-[18px]" style={style}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <h2 className="text-[15px] font-extrabold tracking-tight">Mis Directoras</h2>
                <small className="text-[11.5px] text-muted-foreground">El seguimiento de tu Área este mes</small>
            </div>

            {loading ? (
                <span className="hoy-skel mt-3 block h-32 rounded-2xl" />
            ) : !data?.area_month ? (
                <p className="mt-2 text-[12.5px] text-muted-foreground">Carga tu Reconocimiento del Área y aquí verás cómo va cada Directora de tu Área.</p>
            ) : (
                <div className="mt-3 grid grid-cols-1 gap-x-6 gap-y-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
                    <div className="flex items-center gap-4">
                        {summary && summary.with_app > 0 && <RingMeter percent={summary.percent} size={104} stroke={8} label="del Área" />}
                        <p className="text-[12.5px] text-muted-foreground">
                            <b className="block text-[15px] text-foreground">{summary?.with_app ?? 0} de tus {summary?.directors ?? 0} Directoras usan Eyplease+</b>
                            {summary?.with_app
                                ? <>Entre todas llegaron a <b className="text-foreground">{summary.people_reached} de {summary.people_count}</b> consultoras.</>
                                : 'Invítalas y aquí verás cómo va el seguimiento de cada una.'}
                        </p>
                    </div>

                    <div>
                        {withApp.length > 0 && (
                            <ul className="grid gap-1">
                                {withApp.slice(0, MAX_FILAS).map(director => {
                                    const app = director.app!
                                    const escalon = escalonAlcanzado(app.coverage.percent)
                                    return (
                                        <li key={director.id} className="flex items-center gap-2.5 py-1">
                                            <RingMeter percent={app.coverage.percent} size={36} stroke={4} label="">
                                                <b className="text-[9.5px] font-extrabold tabular-nums">{app.coverage.percent}%</b>
                                            </RingMeter>
                                            <span className="min-w-0 flex-1 leading-tight">
                                                <b className="block truncate text-[12.5px] font-bold">{director.name}</b>
                                                <small className="text-[11px] text-muted-foreground">
                                                    {sinEnviarHaceMucho(director)
                                                        ? (app.last_sent_at ? `Sin enviar desde ${haceCuanto(app.last_sent_at)}` : 'Todavía no envía nada')
                                                        : app.pending_total > 0 ? `Le ${app.pending_total === 1 ? 'falta 1 pieza' : `faltan ${app.pending_total} piezas`}` : 'Al día'}
                                                </small>
                                            </span>
                                            {escalon && <span className={cn(TAG, 'bg-[#6C47FF]/10 text-[#6C47FF] dark:text-[#BBAAFF]')}>{escalon.nombre === 'Unidad completa' ? 'Completa' : escalon.nombre}</span>}
                                        </li>
                                    )
                                })}
                            </ul>
                        )}

                        {toInvite.length > 0 && (
                            <div className="hoy-soft mt-2 flex items-center gap-3 rounded-2xl px-3 py-2.5">
                                <span className="flex shrink-0">
                                    {toInvite.slice(0, 3).map((director, index) => (
                                        <span key={director.id} className={cn('rounded-full border-2 border-card', index && '-ml-2.5')}><Avatar director={director} size={28} /></span>
                                    ))}
                                </span>
                                <p className="min-w-0 flex-1 text-[12px] leading-snug">
                                    <b className="font-extrabold">{toInvite.length} {toInvite.length === 1 ? 'Directora' : 'Directoras'}</b> de tu Área todavía no {toInvite.length === 1 ? 'está' : 'están'} en Eyplease+.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {data?.area_month && (
                <Link to={APP_ROUTES.MY_DIRECTORS} className="hoy-cta mt-4 flex h-[40px] items-center justify-center gap-1.5 rounded-[13px] text-[13px] font-bold text-white">
                    Ver mis Directoras <ChevronRightIcon className="size-4" />
                </Link>
            )}
        </section>
    )
}

export default AreaDirectorsCard
