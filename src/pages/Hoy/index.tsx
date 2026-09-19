import { useRef, useState } from 'react'

import HomeOverdueBanner from '@/components/billing/enforcement/HomeOverdueBanner'
import BirthdayBanner from '@/pages/Dashboard/components/BirthdayBanner'
import useAuthStore from '@/store/auth'
import { titleCaseName } from './lib'
import HoyRail from './components/HoyRail'
import NovedadesStories from './components/NovedadesStories'
import UnitFeed from './components/UnitFeed'
import useUnitToday from './hooks/useUnitToday'
import './hoy.css'

/**
 * Hoy: la portada del rediseño, con la misma organización que el Hoy de la app. Arriba lo
 * urgente (pago, su cumpleaños), luego Novedades (la biblioteca, en historias) y el feed de su
 * unidad, con lo de hoy primero. A la izquierda, quién es y cómo va su seguimiento; a la
 * derecha ya está el Asistente, que lo pone el marco.
 *
 * Sólo se monta con el marco nuevo encendido: `pages/Dashboard` decide.
 */
const HoyPage = () => {
    const user = useAuthStore(state => state.user)
    const feed = useUnitToday()
    const [chip, setChip] = useState('all')
    const feedRef = useRef<HTMLDivElement>(null)

    const firstName = titleCaseName((user?.name ?? '').trim().split(/\s+/)[0] ?? '')
    const todayPieces = feed.todayGroups.reduce((sum, group) => sum + group.pieces.length, 0)
    const waiting = feed.groups.reduce((sum, group) => sum + group.pieces.length - group.shared, 0)

    const onPickSection = (section: string) => {
        setChip(section)
        feedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    return (
        /* En ancho, la columna del seguimiento va fija a la izquierda. Más angosto, primero el saludo,
           luego el seguimiento en compacto y después el feed: lo primero que se lee es qué pasó hoy. */
        <div className="hoy-page grid grid-cols-1 items-start gap-x-[18px] gap-y-4 [grid-template-areas:'head'_'rail'_'body'] xl:grid-cols-[280px_minmax(0,1fr)] xl:grid-rows-[auto_1fr] xl:[grid-template-areas:'rail_head'_'rail_body']">
            <header className="hoy-rise mx-auto w-full max-w-(--hoy-col) [grid-area:head]">
                <p className="text-[10.5px] font-extrabold tracking-[.14em] text-[#6C47FF] uppercase dark:text-[#A894FF]">
                    {new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
                <h1 className="hoy-title mt-1 text-[28px] leading-[1.1] font-extrabold tracking-tight">
                    {firstName ? `Hola, ${firstName}.` : 'Hola.'} <em>Esto pasó hoy.</em>
                </h1>
                {!feed.loading && feed.groups.length > 0 && (
                    <p className="mt-1.5 text-[13.5px] text-muted-foreground">
                        {todayPieces === 0
                            ? 'Hoy no hay piezas nuevas'
                            : `${todayPieces} ${todayPieces === 1 ? 'pieza nueva' : 'piezas nuevas'} hoy`}
                        {waiting > 0 && ` y ${waiting} esperando a que ${waiting === 1 ? 'la' : 'las'} compartas`}.
                    </p>
                )}
            </header>

            {/* Fija al lado del feed, pero con su PROPIO desplazamiento: si la pantalla es baja y no cabe
                entera, se baja con la rueda sobre ella en vez de quedar inalcanzable hasta el final del feed */}
            <aside className="hoy-rail mx-auto grid w-full max-w-(--hoy-col) grid-cols-1 gap-4 [grid-area:rail] empty:hidden xl:sticky xl:top-[90px] xl:max-h-[calc(100vh-106px)] xl:max-w-none xl:overflow-y-auto xl:pb-2">
                <HoyRail onPickSection={onPickSection} />
            </aside>

            <div className="mx-auto grid w-full max-w-(--hoy-col) grid-cols-1 gap-4 [grid-area:body]">
                <HomeOverdueBanner />
                <BirthdayBanner />

                <NovedadesStories index={1} />

                <div ref={feedRef} className="scroll-mt-[96px]">
                    <UnitFeed feed={feed} chip={chip} onChip={setChip} index={2} />
                </div>
            </div>
        </div>
    )
}

export default HoyPage
