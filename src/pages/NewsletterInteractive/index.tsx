import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { ArrowLeftIcon, CheckIcon, ChevronDownIcon, EyeOffIcon, MonitorIcon, SlidersHorizontalIcon, SmartphoneIcon } from 'lucide-react'

import { API_ROUTES } from '@/constants/api'
import { APP_ROUTES } from '@/constants/app'
import useFetchQuery from '@/hooks/useFetchQuery'
import { NewsletterTypes, Template } from '@/interfaces/common'
import { cn } from '@/lib/utils'
import ContentPreferencesSheet from '@/components/reportPreferences/ContentPreferencesSheet'
import { useReportPreferences } from '@/components/reportPreferences/useReportPreferences'
import { isSectionHidden } from '@/components/reportPreferences/utils'
import useAuthStore from '@/store/auth'
import '@/pages/Hoy/hoy.css'
import { BoletinPlayer, createBoletinPlayer, SKINS } from './engine/player'
import { FormatKey, SkinKey } from './engine/types'
import { normalizeUnity, templateArtBase, UnityRaw } from './normalize'

const CARD = 'shell-glass hoy-rise rounded-[22px] p-[18px]'
const SEGMENT = 'inline-flex flex-wrap rounded-xl bg-foreground/5 p-[3px]'
const SEGMENT_ITEM = 'flex h-8 cursor-pointer items-center gap-1.5 rounded-[9px] px-3 text-[12px] font-bold transition-colors'
const SKIN_KEY = 'boletin-interactivo:piel'
/* Las secciones apagadas son de la presentación de ESE mes: el mes siguiente arranca con todo */
const OFF_KEY = (yearMonth: string) => `boletin-interactivo:apagadas:${yearMonth}`
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

/** El mes del boletín por defecto es el anterior, igual que el PDF (`getReportDates`). */
const lastMonths = (count: number): string[] => {
    const date = new Date()
    date.setDate(1)
    return Array.from({ length: count }, () => {
        date.setMonth(date.getMonth() - 1)
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    })
}
const monthLabel = (yearMonth: string) => {
    const [year, month] = yearMonth.split('-').map(Number)
    return `${MESES[month - 1]} ${year}`
}

/** Arte de unidad de la plantilla: primero lo que trae su catálogo, si no, la carpeta de su portada. */
const artOf = (template?: Template): string | undefined => {
    const cover = (template?.unity_background_horizontal as { covers?: Record<string, string> } | undefined)?.covers?.honor_roll
    const fromCovers = cover?.match(/^(.*)\/horizontal\/[^/]+$/)?.[1]
    return fromCovers ?? templateArtBase(template?.picture?.url)
}

const readOff = (yearMonth: string): string[] => {
    try {
        const list: unknown = JSON.parse(localStorage.getItem(OFF_KEY(yearMonth)) ?? '[]')
        return Array.isArray(list) ? list.filter((key): key is string => typeof key === 'string') : []
    } catch {
        return []
    }
}

const readSkin = (): SkinKey | null => {
    try {
        const saved = localStorage.getItem(SKIN_KEY) as SkinKey | null
        return saved && saved in SKINS ? saved : null
    } catch {
        return null
    }
}

/**
 * El boletín de unidad, interactivo. Mismos datos, mismas reglas y misma configuración de
 * contenido que el PDF: la data sale de `reports/unity` y lo que la Directora ocultó en
 * «Personalizar contenido» no aparece. Lo dibuja el reproductor (`engine/player.ts`).
 */
const NewsletterInteractivePage = () => {
    const [params, setParams] = useSearchParams()
    const user = useAuthStore(state => state.user)
    const { newsletters, templates } = useAuthStore(state => state.utilData)
    const preferences = useReportPreferences()

    const months = useMemo(() => lastMonths(6), [])
    const yearMonth = params.get('mes') && /^\d{4}-\d{2}$/.test(params.get('mes') as string) ? params.get('mes') as string : months[0]
    const hasUnity = newsletters.some(newsletter => newsletter.code === NewsletterTypes.UNITY)

    /* La plantilla: la que viene del generador, la suya o la más nueva */
    const template = templates.find(item => item.id === params.get('plantilla'))
        ?? templates.find(item => item.id === user?.template_id)
        ?? templates[templates.length - 1]
    const arte = artOf(template)

    const [skin, setSkin] = useState<SkinKey>(() => readSkin() ?? (arte ? 'plantilla' : 'gala'))
    const [format, setFormat] = useState<FormatKey>(() => (window.innerWidth < 720 ? 'phone' : 'wide'))
    const skins = (Object.keys(SKINS) as SkinKey[]).filter(key => key !== 'plantilla' || !!arte)
    const activeSkin = skins.includes(skin) ? skin : skins[0]

    const queryParams = useMemo(() => ({ year_month: yearMonth }), [yearMonth])
    const { response, loading, error, fetchRetry } = useFetchQuery<UnityRaw>(API_ROUTES.REPORTS.UNITY, {
        queryParams,
        enabled: hasUnity,
        staleTime: 300_000,
    })

    const data = useMemo(() => {
        if (!response?.data || !user) return null
        return normalizeUnity(response.data, {
            yearMonth,
            hidden: preferences.saved,
            colombia: ['COL', 'CO'].includes((user.country ?? '').toUpperCase()),
            directora: { nombre: user.name, foto: user.profile_picture?.url || undefined },
            arte,
        })
    }, [response, user, yearMonth, preferences.saved, arte])

    /* Prender y apagar secciones, sólo para esta presentación (lo permanente es «Personalizar contenido») */
    const [offByMonth, setOffByMonth] = useState<Record<string, string[]>>({})
    const apagadas = useMemo(() => new Set(offByMonth[yearMonth] ?? readOff(yearMonth)), [offByMonth, yearMonth])
    const saveOff = (next: Set<string>) => {
        setOffByMonth(current => ({ ...current, [yearMonth]: [...next] }))
        try {
            if (next.size) localStorage.setItem(OFF_KEY(yearMonth), JSON.stringify([...next]))
            else localStorage.removeItem(OFF_KEY(yearMonth))
        } catch { /* sin almacenamiento: vale para esta visita */ }
    }
    const toggleSeccion = (key: string) => {
        const next = new Set(apagadas)
        if (next.has(key)) next.delete(key)
        else next.add(key)
        saveOff(next)
    }
    const secciones = data?.secciones ?? []
    const encendidas = secciones.filter(seccion => !apagadas.has(seccion.key)).length
    const shown = useMemo(() => (data ? { ...data, secciones: data.secciones.filter(seccion => !apagadas.has(seccion.key)) } : null), [data, apagadas])

    /* Las que ocultó en «Personalizar contenido»: se enseñan para que sepa por qué no salen */
    const [sheetOpen, setSheetOpen] = useState(false)
    /* En el teléfono la lista se pliega para que el boletín quede a la vista */
    const [chipsOpen, setChipsOpen] = useState(() => window.innerWidth >= 720)
    const ocultas = useMemo(() => preferences.catalog?.newsletters
        .find(newsletter => newsletter.code === NewsletterTypes.UNITY)?.sections
        .filter(section => isSectionHidden(preferences.saved, NewsletterTypes.UNITY, section)) ?? [], [preferences.catalog, preferences.saved])

    /* El reproductor se arma una vez por boletín; piel y formato se le cambian en vivo */
    const hostRef = useRef<HTMLDivElement>(null)
    const playerRef = useRef<BoletinPlayer | null>(null)
    const viewRef = useRef({ skin: activeSkin, format })
    viewRef.current = { skin: activeSkin, format }

    useEffect(() => {
        if (!hostRef.current || !shown?.secciones.length) return
        const player = createBoletinPlayer(hostRef.current, shown, viewRef.current)
        playerRef.current = player
        return () => {
            player.destroy()
            playerRef.current = null
        }
    }, [shown])

    useEffect(() => { playerRef.current?.setSkin(activeSkin) }, [activeSkin])
    useEffect(() => { playerRef.current?.setFormat(format) }, [format])

    const chooseSkin = (next: SkinKey) => {
        setSkin(next)
        try { localStorage.setItem(SKIN_KEY, next) } catch { /* sin almacenamiento: sólo no se recuerda */ }
    }
    const chooseMonth = (next: string) => {
        const nextParams = new URLSearchParams(params)
        nextParams.set('mes', next)
        setParams(nextParams, { replace: true })
    }

    const vacio = !!data && data.secciones.length === 0

    return (
        <div className="grid grid-cols-1 gap-4">
            <header className="hoy-rise flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="text-[10.5px] font-extrabold tracking-[.14em] text-[#6C47FF] uppercase dark:text-[#A894FF]">Boletín interactivo · {monthLabel(yearMonth)}</p>
                    <h1 className="hoy-title mt-1 text-[28px] leading-[1.1] font-extrabold tracking-tight">Tu boletín, <em>en vivo</em></h1>
                    <p className="mt-1.5 max-w-[66ch] text-[13.5px] text-muted-foreground">El mismo contenido de tu PDF, para presentarlo en tu junta o que cada quien se busque. Pantalla completa con la tecla F; flechas para avanzar.</p>
                </div>
                <Link to={APP_ROUTES.HOME.NEWSLETTER} className="flex h-9 items-center gap-1.5 rounded-[11px] bg-foreground/5 px-3 text-[12.5px] font-bold transition-colors hover:bg-foreground/10">
                    <ArrowLeftIcon className="size-3.5" /> Volver al boletín
                </Link>
            </header>

            {hasUnity && (
                <section className={cn(CARD, 'flex flex-wrap items-center gap-x-5 gap-y-3')} style={{ '--i': 1 } as React.CSSProperties}>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-extrabold tracking-[.12em] text-muted-foreground uppercase">Piel</span>
                        <div className={SEGMENT}>
                            {skins.map(key => (
                                <button key={key} type="button" onClick={() => chooseSkin(key)} title={key === 'plantilla' && template ? `El arte de ${template.name}` : undefined}
                                    className={cn(SEGMENT_ITEM, activeSkin === key ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
                                    <span className="size-3.5 rounded-full ring-1 ring-black/10" style={{ background: SKINS[key].sw }} />
                                    {key === 'plantilla' && template ? template.name : SKINS[key].label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className={SEGMENT}>
                        <button type="button" onClick={() => setFormat('wide')} className={cn(SEGMENT_ITEM, format === 'wide' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
                            <MonitorIcon className="size-3.5" /> Pantalla · junta
                        </button>
                        <button type="button" onClick={() => setFormat('phone')} className={cn(SEGMENT_ITEM, format === 'phone' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
                            <SmartphoneIcon className="size-3.5" /> Teléfono
                        </button>
                    </div>
                    <label className="ml-auto flex items-center gap-2 text-[12px] font-bold text-muted-foreground">
                        Mes
                        <select value={yearMonth} onChange={event => chooseMonth(event.target.value)} className="h-8 cursor-pointer rounded-[10px] border bg-card px-2.5 text-[12.5px] font-bold text-foreground">
                            {months.map(month => <option key={month} value={month}>{monthLabel(month)}</option>)}
                        </select>
                    </label>
                </section>
            )}

            {hasUnity && (secciones.length > 0 || ocultas.length > 0) && (
                <section className={CARD} style={{ '--i': 2 } as React.CSSProperties}>
                    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                        <button type="button" aria-expanded={chipsOpen} onClick={() => setChipsOpen(open => !open)} className="flex min-w-0 cursor-pointer items-start gap-2 text-left">
                            <span className="min-w-0">
                                <span className="block text-[15px] font-extrabold tracking-tight">Secciones de la presentación</span>
                                <span className="block text-[12px] text-muted-foreground">{encendidas} de {secciones.length} · prende o apaga para esta presentación; lo permanente va en «Personalizar contenido»</span>
                            </span>
                            <ChevronDownIcon className={cn('mt-1 size-4 shrink-0 text-muted-foreground transition-transform', chipsOpen && 'rotate-180')} />
                        </button>
                        <div className="flex gap-2">
                            {chipsOpen && secciones.length > 1 && (
                                <button type="button" onClick={() => saveOff(apagadas.size ? new Set() : new Set(secciones.map(seccion => seccion.key)))} className="h-8 cursor-pointer rounded-[11px] bg-foreground/5 px-3 text-[12px] font-bold transition-colors hover:bg-foreground/10">
                                    {apagadas.size ? 'Prender todas' : 'Apagar todas'}
                                </button>
                            )}
                            <button type="button" onClick={() => setSheetOpen(true)} className="flex h-8 cursor-pointer items-center gap-1.5 rounded-[11px] bg-[#6C47FF]/10 px-3 text-[12px] font-bold text-[#6C47FF] transition-colors hover:bg-[#6C47FF]/18 dark:text-[#C4B5FF]">
                                <SlidersHorizontalIcon className="size-3.5" /> Personalizar contenido
                            </button>
                        </div>
                    </div>

                    {chipsOpen && <div className="mt-3.5 flex flex-wrap gap-2">
                        {secciones.map(seccion => {
                            const on = !apagadas.has(seccion.key)
                            return (
                                <button
                                    key={seccion.key}
                                    type="button"
                                    aria-pressed={on}
                                    onClick={() => toggleSeccion(seccion.key)}
                                    className={cn('inline-flex h-9 cursor-pointer items-center gap-2 rounded-full border px-3.5 text-[12.5px] font-semibold transition-colors', on ? 'border-[#6C47FF]/35 bg-[#6C47FF]/10 text-[#6C47FF] dark:text-[#C4B5FF]' : 'bg-card/60 text-muted-foreground hover:border-[#6C47FF]/35')}
                                >
                                    <span className={cn('grid size-[15px] place-items-center rounded-[5px] border-[1.5px] transition-colors', on ? 'border-[#6C47FF] bg-[#6C47FF] text-white' : 'border-border')}>
                                        {on && <CheckIcon className="size-2.5" strokeWidth={3.5} />}
                                    </span>
                                    {seccion.titulo}
                                </button>
                            )
                        })}
                        {ocultas.map(section => (
                            <button key={section.section_key} type="button" title="Oculta por tu configuración. Toca para cambiarla." onClick={() => setSheetOpen(true)} className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-full border border-dashed px-3.5 text-[12.5px] font-medium text-muted-foreground/80">
                                <EyeOffIcon className="size-3.5" /> {section.name}
                            </button>
                        ))}
                    </div>}
                </section>
            )}

            {!hasUnity ? (
                <section className={CARD}>
                    <h2 className="text-[15px] font-extrabold tracking-tight">Tu plan no incluye el boletín de unidad</h2>
                    <p className="mt-1 text-[13px] text-muted-foreground">El boletín interactivo usa los mismos datos del boletín de unidad.</p>
                </section>
            ) : error ? (
                <section className={CARD}>
                    <h2 className="text-[15px] font-extrabold tracking-tight">No se pudo cargar tu boletín</h2>
                    <p className="mt-1 text-[13px] text-muted-foreground">Revisa tu conexión e inténtalo de nuevo.</p>
                    <button type="button" onClick={fetchRetry} className="hoy-cta mt-3 h-10 cursor-pointer rounded-[13px] px-5 text-[13px] font-bold text-white">Reintentar</button>
                </section>
            ) : loading || !data ? (
                <span className="hoy-skel block aspect-video w-full rounded-[22px]" />
            ) : vacio ? (
                <section className={CARD}>
                    <h2 className="text-[15px] font-extrabold tracking-tight">Todavía no hay reconocimientos en {monthLabel(yearMonth)}</h2>
                    <p className="mt-1 text-[13px] text-muted-foreground">En cuanto estén cargados los reportes del mes, tu boletín aparece aquí solo.</p>
                    <Link to={APP_ROUTES.REPORTS} className="mt-3 inline-flex h-9 items-center rounded-[11px] bg-[#6C47FF]/10 px-3 text-[12.5px] font-bold text-[#6C47FF] dark:text-[#C4B5FF]">Ver mis reportes</Link>
                </section>
            ) : !encendidas ? (
                <section className={CARD}>
                    <h2 className="text-[15px] font-extrabold tracking-tight">Apagaste todas las secciones</h2>
                    <p className="mt-1 text-[13px] text-muted-foreground">Prende al menos una para presentar tu boletín.</p>
                    <button type="button" onClick={() => saveOff(new Set())} className="hoy-cta mt-3 h-10 cursor-pointer rounded-[13px] px-5 text-[13px] font-bold text-white">Prender todas</button>
                </section>
            ) : (
                <div ref={hostRef} className="hoy-rise" style={{ '--i': 3 } as React.CSSProperties} />
            )}

            <ContentPreferencesSheet open={sheetOpen} preferences={preferences} newsletterCode={NewsletterTypes.UNITY} onOpenChange={setSheetOpen} />
        </div>
    )
}

export default NewsletterInteractivePage
