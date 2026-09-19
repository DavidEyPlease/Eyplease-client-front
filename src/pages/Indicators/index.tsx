import { useEffect, useState } from 'react'
import { Navigate } from 'react-router'
import { PlusIcon, SparklesIcon } from 'lucide-react'
import { toast } from 'sonner'

import { API_ROUTES } from '@/constants/api'
import { APP_ROUTES } from '@/constants/app'
import useChallenges from '@/hooks/useChallenges'
import useFetchQuery from '@/hooks/useFetchQuery'
import { BusinessIndicators, IChallenge, NewChallenge } from '@/interfaces/challenges'
import { isNewShell } from '@/layouts/TopShell/useNewShell'
import { cn } from '@/lib/utils'
import useUnitFollowUp, { ESCALONES } from '@/pages/Dashboard/components/useUnitFollowUp'
import RingMeter from '@/pages/Hoy/components/RingMeter'
import '@/pages/Hoy/hoy.css'
import ChallengeCard from './components/ChallengeCard'
import ChallengeDialog from './components/ChallengeDialog'
import NewUnitChallengeDialog from './components/NewUnitChallengeDialog'
import ProposalDialog from './components/ProposalDialog'
import { monthName } from './helpers'

const CARD = 'shell-glass hoy-rise rounded-[22px] p-[18px]'
const rise = (index: number) => ({ '--i': index } as React.CSSProperties)

/** El número sube contando hasta su valor: se nota que es un dato vivo, no un rótulo. */
const CountUp = ({ value }: { value: number }) => {
    const [shown, setShown] = useState(0)

    useEffect(() => {
        /* Con la pestaña en segundo plano no corren los fotogramas: el número se quedaría en cero, y un cero aquí se lee como dato */
        if (document.hidden || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return setShown(value)
        const start = performance.now()
        let frame = 0
        const tick = (now: number) => {
            const t = Math.min((now - start) / 900, 1)
            setShown(Math.round(value * (1 - Math.pow(1 - t, 3))))
            if (t < 1) frame = requestAnimationFrame(tick)
        }
        frame = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(frame)
    }, [value])

    return <>{shown.toLocaleString('es-MX')}</>
}

/**
 * Indicadores: los números de su negocio (de sus reportes), su seguimiento de unidad, los retos
 * que acepta y los que pone a su unidad. La misma pantalla, datos y contrato que en la app.
 */
const IndicatorsPage = () => {
    const { loading, cobertura, secciones } = useUnitFollowUp()
    const business = useFetchQuery<BusinessIndicators>(API_ROUTES.INDICATORS.BUSINESS, {
        customQueryKey: ['indicators', 'business'],
        staleTime: 5 * 60 * 1000,
    })
    const challenges = useChallenges()

    const [opened, setOpened] = useState<IChallenge | null>(null)
    const [proposalOpen, setProposalOpen] = useState(false)
    const [newOpen, setNewOpen] = useState(false)
    const [createError, setCreateError] = useState('')

    /* La página nace con el marco nuevo: con el de siempre no hay desde dónde llegar */
    if (!isNewShell()) return <Navigate to={APP_ROUTES.HOME.INITIAL} replace />

    const data = business.response?.data
    const percent = cobertura?.percent ?? 0
    const next = ESCALONES.find(escalon => percent < escalon.pct)
    const missing = cobertura && next ? Math.max(Math.ceil(cobertura.people_count * next.pct / 100) - cobertura.people_reached, 0) : 0

    /* Si un reporte no se ha cargado este mes el número va en «—», nunca en cero */
    const tiles = [
        { label: 'Reto de las 5', value: data ? data.leaders.count : null, sub: 'con 5 o más en su grupo', color: 'text-[#6C47FF] dark:text-[#A894FF]' },
        { label: 'Pidieron este mes', value: data?.ordered.count, sub: data?.ordered.total ? `de ${data.ordered.total} en la unidad` : 'en la unidad', color: 'text-emerald-600 dark:text-emerald-400' },
        { label: 'Con corazones', value: data?.with_hearts.count, sub: 'constancia en Círculo Rosa', color: 'text-[#E5077D]' },
        { label: 'Cerca del regalo', value: data?.near_gift.count, sub: 'a 3 meses o menos de su Aniversario', color: 'text-amber-600 dark:text-amber-400' },
    ]

    const onCreate = async (payload: NewChallenge) => {
        setCreateError('')
        try {
            await challenges.create(payload)
            setNewOpen(false)
            toast.success('Reto puesto a tu unidad')
        } catch (error) {
            setCreateError((error as { message?: string })?.message || 'No se pudo crear el reto')
        }
    }

    return (
        <div className="grid grid-cols-1 gap-4">
            <header className="hoy-rise flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="text-[10.5px] font-extrabold tracking-[.14em] text-[#6C47FF] uppercase dark:text-[#A894FF]">Indicadores{data?.month ? ` · ${monthName(data.month)}` : ''}</p>
                    <h1 className="hoy-title mt-1 text-[28px] leading-[1.1] font-extrabold tracking-tight">Así va <em>tu negocio</em></h1>
                    <p className="mt-1.5 max-w-[62ch] text-[13.5px] text-muted-foreground">Tu alcance por personas, cómo se mueve cada sección y los retos que aceptas o pones a tu unidad. Todo sale de tus reportes: no hay nada que capturar.</p>
                </div>
                <button type="button" onClick={() => setProposalOpen(true)} className="hoy-cta flex h-[38px] cursor-pointer items-center gap-2 rounded-[13px] px-4 text-[13px] font-bold text-white">
                    <SparklesIcon className="size-[15px]" /> Proponme un reto
                </button>
            </header>

            <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
                {tiles.map((tile, index) => (
                    <div key={tile.label} className={cn(CARD, 'px-4 py-3.5')} style={rise(index + 1)}>
                        <p className="text-[10.5px] font-extrabold tracking-wider text-muted-foreground uppercase">{tile.label}</p>
                        {business.loading
                            ? <span className="hoy-skel my-1.5 block h-8 w-14 rounded-lg" />
                            : <p className={cn('text-[32px] leading-tight font-extrabold tabular-nums', tile.value == null ? 'text-muted-foreground/50' : tile.color)}>{tile.value == null ? '—' : <CountUp value={tile.value} />}</p>}
                        <p className="text-[11.5px] leading-snug text-muted-foreground">{tile.sub}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
                <section className={CARD} style={rise(5)}>
                    <h2 className="text-[15px] font-extrabold tracking-tight">Seguimiento de unidad</h2>
                    {loading ? (
                        <span className="hoy-skel mt-3 block h-32 rounded-2xl" />
                    ) : cobertura && cobertura.people_count > 0 ? (
                        <>
                            <div className="mt-3.5 flex items-center gap-[18px]">
                                <RingMeter percent={percent} size={128} label="alcanzada" />
                                <p className="text-[12.5px] text-muted-foreground">
                                    <b className="block text-[15px] text-foreground">{cobertura.people_reached} de {cobertura.people_count} consultoras</b>
                                    {next
                                        ? <>Siguiente escalón: <b className="text-[#6C47FF] dark:text-[#A894FF]">{next.nombre} · {next.pct}%</b>. Te {missing === 1 ? 'falta 1 persona' : `faltan ${missing} personas`}.</>
                                        : 'No se te quedó nadie fuera este mes.'}
                                </p>
                            </div>
                            <ol className="mt-3.5 grid grid-cols-4 gap-1.5">
                                {ESCALONES.map(escalon => (
                                    <li key={escalon.pct} className={cn(
                                        'rounded-[10px] border px-1 py-1.5 text-center text-[10px] leading-tight font-bold',
                                        percent >= escalon.pct ? 'border-transparent bg-[#6C47FF]/12 text-[#6C47FF] dark:text-[#BBAAFF]'
                                            : escalon === next ? 'border-[#6C47FF]/45' : 'border-dashed text-muted-foreground/70',
                                    )}>
                                        {escalon.nombre === 'Unidad completa' ? 'Completa' : escalon.nombre}<br />{escalon.pct}%
                                    </li>
                                ))}
                            </ol>
                        </>
                    ) : (
                        <p className="mt-2 text-[12.5px] text-muted-foreground">Sin datos de cobertura todavía.</p>
                    )}
                </section>

                <section className={CARD} style={rise(6)}>
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                        <h2 className="text-[15px] font-extrabold tracking-tight">Publicado contra compartido</h2>
                        <small className="text-[11.5px] text-muted-foreground">de tus piezas del mes</small>
                    </div>
                    <ul className="mt-2">
                        {secciones.map(seccion => {
                            const pct = seccion.generadas ? Math.round(seccion.enviadas / seccion.generadas * 100) : 0
                            return (
                                <li key={seccion.key} className="flex items-center gap-3 border-b border-border py-2 last:border-b-0">
                                    <span className="min-w-0 flex-1">
                                        <b className="block truncate text-[12.5px] font-bold">{seccion.label}</b>
                                        <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-foreground/6">
                                            {/* Barra de avance, nunca un semáforo rojo: un color de alarma convierte la meta en una nota reprobatoria */}
                                            <i className={cn('block h-full rounded-full transition-[width] duration-1000', pct >= 50 ? 'bg-linear-to-r from-emerald-500 to-[#2CD4D9]' : 'shell-grad')} style={{ width: `${seccion.generadas ? Math.max(pct, 2) : 0}%` }} />
                                        </span>
                                    </span>
                                    <span className="shrink-0 text-[12.5px] font-extrabold tabular-nums">{seccion.enviadas}<span className="font-semibold text-muted-foreground"> / {seccion.generadas}</span></span>
                                </li>
                            )
                        })}
                    </ul>
                </section>
            </div>

            <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
                <section className={CARD} style={rise(7)}>
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                        <h2 className="text-[15px] font-extrabold tracking-tight">Mis retos</h2>
                        <small className="text-[11.5px] text-muted-foreground">Se te proponen con tus números; tú decides</small>
                    </div>
                    <div className="mt-3 grid gap-2.5">
                        {challenges.loading ? (
                            <span className="hoy-skel h-20 rounded-2xl" />
                        ) : challenges.personal.length === 0 ? (
                            <p className="rounded-2xl border border-dashed px-4 py-5 text-center text-[12.5px] text-muted-foreground">
                                Todavía no tienes retos. Pide uno: se revisan tus números y se te propone el que más te acerca al siguiente escalón.
                            </p>
                        ) : (
                            challenges.personal.map(challenge => <ChallengeCard key={challenge.id} challenge={challenge} onOpen={setOpened} />)
                        )}
                    </div>
                    {!challenges.unavailable && (
                        <button type="button" onClick={() => setProposalOpen(true)} className="mx-auto mt-3 flex cursor-pointer items-center gap-1.5 text-[12.5px] font-bold text-primary hover:underline">
                            <SparklesIcon className="size-3.5" /> Proponme un reto
                        </button>
                    )}
                </section>

                <section className={CARD} style={rise(8)}>
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                        <h2 className="text-[15px] font-extrabold tracking-tight">Retos a mi unidad</h2>
                        <small className="text-[11.5px] text-muted-foreground">los pones tú · premias tú</small>
                    </div>
                    <div className="mt-3 grid gap-2.5">
                        {challenges.loading ? (
                            <span className="hoy-skel h-20 rounded-2xl" />
                        ) : challenges.unit.length === 0 ? (
                            <p className="rounded-2xl border border-dashed px-4 py-5 text-center text-[12.5px] text-muted-foreground">
                                Aún no has puesto retos a tu unidad. Pon una meta de puntos o de corazones, con tu premio.
                            </p>
                        ) : (
                            challenges.unit.map(challenge => <ChallengeCard key={challenge.id} challenge={challenge} onOpen={setOpened} />)
                        )}
                    </div>
                    {!challenges.unavailable && (
                        <button type="button" onClick={() => { setCreateError(''); setNewOpen(true) }} className="mx-auto mt-3 flex cursor-pointer items-center gap-1.5 text-[12.5px] font-bold text-primary hover:underline">
                            <PlusIcon className="size-3.5" /> Nuevo reto para mi unidad
                        </button>
                    )}
                </section>
            </div>

            <ChallengeDialog challenge={opened} onClose={() => setOpened(null)} />
            <ProposalDialog open={proposalOpen} onOpenChange={setProposalOpen} />
            <NewUnitChallengeDialog open={newOpen} saving={challenges.creating} error={createError} unitSize={data?.unit_size} onCreate={onCreate} onOpenChange={setNewOpen} />
        </div>
    )
}

export default IndicatorsPage
