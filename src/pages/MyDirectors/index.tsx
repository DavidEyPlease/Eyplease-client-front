import { useState } from 'react'
import { Link, Navigate } from 'react-router'
import { MessageCircleIcon, SearchIcon } from 'lucide-react'

import { APP_ROUTES } from '@/constants/app'
import { askAssistant } from '@/layouts/TopShell/assistantBridge'
import { isNewShell } from '@/layouts/TopShell/useNewShell'
import { cn } from '@/lib/utils'
import RingMeter from '@/pages/Hoy/components/RingMeter'
import '@/pages/Hoy/hoy.css'
import { DirectorCard, InviteRow } from './components'
import { nombreDelMes } from './lib'
import useAreaDirectors from './useAreaDirectors'

type Filter = 'all' | 'app' | 'invite'

const CARD = 'shell-glass hoy-rise rounded-[22px] p-[18px]'

const normal = (text: string) => text.toLocaleLowerCase('es-MX').normalize('NFD').replace(/[̀-ͯ]/g, '')

/**
 * Mis Directoras (plan Nacional): cómo va el seguimiento del mes de cada Directora de su Área que usa Eyplease+, y
 * las que todavía no están, para invitarlas. La lista del Área sale de su Reconocimiento del Área (como su boletín
 * nacional). Cada Directora sabe que su Nacional ve esto (se le avisa en su tarjeta de seguimiento).
 */
const MyDirectorsPage = () => {
    const { enabled, loading, error, data } = useAreaDirectors()
    const [filter, setFilter] = useState<Filter>('all')
    const [search, setSearch] = useState('')

    /* La página nace con el marco nuevo y es del plan Nacional */
    if (!isNewShell() || !enabled) return <Navigate to={APP_ROUTES.INDICATORS} replace />

    const directors = data?.directors ?? []
    const term = normal(search.trim())
    const visible = directors.filter(director => (term === '' || normal(director.name).includes(term)))
    const withApp = visible.filter(director => director.app)
    const toInvite = visible.filter(director => !director.app)
    const summary = data?.summary

    const FILTERS: Array<{ key: Filter, label: string }> = [
        { key: 'all', label: 'Todas' },
        { key: 'app', label: `En Eyplease+${summary ? ` (${summary.with_app})` : ''}` },
        { key: 'invite', label: `Por invitar${summary ? ` (${summary.without_app})` : ''}` },
    ]

    return (
        <div className="grid grid-cols-1 gap-4">
            <header className="hoy-rise flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="text-[10.5px] font-extrabold tracking-[.14em] text-[#6C47FF] uppercase dark:text-[#A894FF]">Mi negocio</p>
                    <h1 className="hoy-title mt-1 text-[28px] leading-[1.1] font-extrabold tracking-tight">
                        Mis Directoras{summary?.directors ? <> · <em>{summary.directors} en tu Área</em></> : null}
                    </h1>
                    <p className="mt-1.5 max-w-[62ch] text-[13.5px] text-muted-foreground">
                        Cómo va el seguimiento de cada una este mes: a cuántas de sus consultoras les llegó algo suyo y qué le falta enviar.
                        <b className="text-foreground"> Primero a quien más le falta.</b>
                    </p>
                </div>
                <button type="button" onClick={() => askAssistant('¿Cómo van mis Directoras con su seguimiento?')} className="hidden h-[38px] cursor-pointer items-center gap-2 rounded-[13px] bg-[#6C47FF]/10 px-4 text-[13px] font-bold text-[#6C47FF] transition-colors hover:bg-[#6C47FF]/18 lg:flex dark:text-[#C4B5FF]">
                    <MessageCircleIcon className="size-[15px]" /> Que me lo explique el Asistente
                </button>
            </header>

            {loading ? (
                <span className="hoy-skel block h-40 rounded-[22px]" />
            ) : error ? (
                <p className="rounded-2xl border border-dashed px-4 py-5 text-center text-[12.5px] text-muted-foreground">No se pudo cargar ahora. Intenta de nuevo en un momento.</p>
            ) : !data?.area_month ? (
                <section className={CARD}>
                    <h2 className="text-[15px] font-extrabold tracking-tight">Falta tu Reconocimiento del Área</h2>
                    <p className="mt-1.5 max-w-[62ch] text-[13px] text-muted-foreground">
                        Tus Directoras salen de tu reporte de Reconocimiento del Área. En cuanto lo cargues, aquí verás a cada una y cómo va su seguimiento.
                    </p>
                    <Link to={APP_ROUTES.REPORTS} className="hoy-cta mt-3 inline-flex h-[38px] items-center rounded-[13px] px-4 text-[13px] font-bold text-white">Ir a mis reportes</Link>
                </section>
            ) : (
                <>
                    <section className={cn(CARD, 'flex flex-wrap items-center gap-x-6 gap-y-3')} style={{ '--i': 1 } as React.CSSProperties}>
                        {summary && summary.with_app > 0 && (
                            <RingMeter percent={summary.percent} size={104} stroke={8} label="del Área" />
                        )}
                        <div className="min-w-[220px] flex-1">
                            <p className="text-[15px] font-extrabold tracking-tight">
                                {summary?.with_app
                                    ? `${summary.with_app} de tus ${summary.directors} Directoras usan Eyplease+`
                                    : `Ninguna de tus ${summary?.directors ?? 0} Directoras usa Eyplease+ todavía`}
                            </p>
                            <p className="mt-1 text-[12.5px] text-muted-foreground">
                                {summary?.with_app
                                    ? <>Entre todas llegaron a <b className="text-foreground">{summary.people_reached} de {summary.people_count}</b> consultoras este mes.</>
                                    : 'Invítalas: con Eyplease+ cada una reconoce a su unidad, y aquí verás cómo va su seguimiento.'}
                                {summary && summary.without_app > 0 && <> Por invitar: <b className="text-foreground">{summary.without_app}</b>{summary.without_app_people > 0 ? `, con ${summary.without_app_people.toLocaleString('es-MX')} consultoras en sus unidades` : ''}.</>}
                            </p>
                            <p className="mt-1.5 text-[11px] text-muted-foreground/80">Tu Área según tu Reconocimiento del Área de {nombreDelMes(data.area_month)}.</p>
                        </div>
                    </section>

                    <div className="hoy-rise flex flex-wrap items-center gap-2" style={{ '--i': 2 } as React.CSSProperties}>
                        <div className="inline-flex rounded-xl bg-foreground/5 p-[3px]">
                            {FILTERS.map(item => (
                                <button key={item.key} type="button" onClick={() => setFilter(item.key)} className={cn('h-[30px] cursor-pointer rounded-[9px] px-3 text-[12px] font-bold whitespace-nowrap transition-colors', filter === item.key ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
                                    {item.label}
                                </button>
                            ))}
                        </div>
                        <label className="flex h-9 items-center gap-2 rounded-xl border border-border bg-card/60 px-3 text-[12.5px] focus-within:border-[#6C47FF]/50">
                            <SearchIcon className="size-[15px] text-muted-foreground" />
                            <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscar por nombre" className="w-36 bg-transparent outline-none placeholder:text-muted-foreground" />
                        </label>
                    </div>

                    {filter !== 'invite' && (
                        withApp.length > 0 ? (
                            <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 xl:grid-cols-3">
                                {withApp.map((director, index) => <DirectorCard key={director.id} director={director} style={{ '--i': index + 3 } as React.CSSProperties} />)}
                            </div>
                        ) : filter === 'app' && (
                            <p className="rounded-2xl border border-dashed px-4 py-5 text-center text-[12.5px] text-muted-foreground">
                                {term ? 'Ninguna con ese nombre.' : 'Todavía ninguna Directora de tu Área usa Eyplease+.'}
                            </p>
                        )
                    )}

                    {filter !== 'app' && toInvite.length > 0 && (
                        <section className={CARD} style={{ '--i': withApp.length + 3 } as React.CSSProperties}>
                            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                                <h2 className="text-[15px] font-extrabold tracking-tight">Todavía no están en Eyplease+</h2>
                                <small className="text-[11.5px] text-muted-foreground">Las unidades más grandes primero</small>
                            </div>
                            <ul className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
                                {toInvite.map(director => <InviteRow key={director.id} director={director} link={data.invite_link} />)}
                            </ul>
                        </section>
                    )}

                    {term && withApp.length === 0 && toInvite.length === 0 && filter === 'all' && (
                        <p className="rounded-2xl border border-dashed px-4 py-5 text-center text-[12.5px] text-muted-foreground">Ninguna con ese nombre.</p>
                    )}

                    {/* Lo que la Directora sabe que su Nacional ve (privacidad, David 29-oct-2026) */}
                    <p className="text-[11.5px] text-muted-foreground/80">
                        Cada Directora sabe que ves su seguimiento: sólo el porcentaje y lo que le falta por sección, nunca sus piezas ni los datos de sus consultoras.
                    </p>
                </>
            )}
        </div>
    )
}

export default MyDirectorsPage
