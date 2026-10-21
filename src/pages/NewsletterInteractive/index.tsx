import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { ArrowLeftIcon, MonitorIcon, SmartphoneIcon } from 'lucide-react'

import { API_ROUTES } from '@/constants/api'
import { APP_ROUTES } from '@/constants/app'
import useFetchQuery from '@/hooks/useFetchQuery'
import { NewsletterTypes, Template } from '@/interfaces/common'
import { cn } from '@/lib/utils'
import { useReportPreferences } from '@/components/reportPreferences/useReportPreferences'
import useAuthStore from '@/store/auth'
import '@/pages/Hoy/hoy.css'
import { BoletinPlayer, createBoletinPlayer, SKINS } from './engine/player'
import { FormatKey, SkinKey } from './engine/types'
import { normalizeUnity, templateArtBase, UnityRaw } from './normalize'

const CARD = 'shell-glass hoy-rise rounded-[22px] p-[18px]'
const SEGMENT = 'inline-flex flex-wrap rounded-xl bg-foreground/5 p-[3px]'
const SEGMENT_ITEM = 'flex h-8 cursor-pointer items-center gap-1.5 rounded-[9px] px-3 text-[12px] font-bold transition-colors'
const SKIN_KEY = 'boletin-interactivo:piel'
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

    /* El reproductor se arma una vez por boletín; piel y formato se le cambian en vivo */
    const hostRef = useRef<HTMLDivElement>(null)
    const playerRef = useRef<BoletinPlayer | null>(null)
    const viewRef = useRef({ skin: activeSkin, format })
    viewRef.current = { skin: activeSkin, format }

    useEffect(() => {
        if (!hostRef.current || !data?.secciones.length) return
        const player = createBoletinPlayer(hostRef.current, data, viewRef.current)
        playerRef.current = player
        return () => {
            player.destroy()
            playerRef.current = null
        }
    }, [data])

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
            ) : (
                <div ref={hostRef} className="hoy-rise" style={{ '--i': 2 } as React.CSSProperties} />
            )}
        </div>
    )
}

export default NewsletterInteractivePage
