import { useState } from 'react'
import { useNavigate } from 'react-router'
import { BookmarkIcon, LibraryBigIcon } from 'lucide-react'

import { APP_ROUTES } from '@/constants/app'
import useSavedTools from '@/hooks/useSavedTools'
import { cn } from '@/lib/utils'
import { isImage } from '@/utils'
import { TOOL_SECTION_ICON } from '@/pages/Tools/utils'
import useNovedades, { NovedadesSection, SAVED_SECTION } from '../hooks/useNovedades'
import StoryViewer from './StoryViewer'

const SEEN_KEY = 'eyplease:novedades-vistas'

/** Por sección, la pieza más nueva que ya vio: si llega otra, el anillo vuelve a encenderse. */
const readSeen = (): Record<string, string> => {
    try {
        return JSON.parse(localStorage.getItem(SEEN_KEY) || '{}')
    } catch {
        return {}
    }
}

/**
 * Novedades: lo que la biblioteca preparó, como historias. Un anillo por sección que el plan
 * trae; de color si hay algo que no ha visto, con el número de las que llegaron hoy.
 */
const NovedadesStories = ({ index = 0 }: { index?: number }) => {
    const navigate = useNavigate()
    const { novedades, loading, hasLibrary } = useNovedades()
    const [seen, setSeen] = useState(readSeen)
    const [openKey, setOpenKey] = useState<string | null>(null)
    const { saved } = useSavedTools()

    /* Guardados va como una sección más del visor, al final: lo que apartó para después */
    const savedSection: NovedadesSection | null = saved.length
        ? { key: SAVED_SECTION, label: 'Guardados', items: saved, cover: saved.flatMap(item => item.files).find(file => isImage(file.ext))?.url ?? null, today: 0 }
        : null
    const viewerSections = savedSection ? [...novedades, savedSection] : novedades

    if (!hasLibrary || (!loading && !novedades.length)) return null

    const markSeen = (section: NovedadesSection) => {
        const newest = section.items[0]?.id
        if (!newest || seen[section.key] === newest) return
        const next = { ...seen, [section.key]: newest }
        setSeen(next)
        try {
            localStorage.setItem(SEEN_KEY, JSON.stringify(next))
        } catch {
            /* Sin almacenamiento el anillo se reenciende al recargar; nada más */
        }
    }

    return (
        <section className="shell-glass hoy-rise rounded-[22px] px-4 pt-3.5 pb-3" style={{ '--i': index } as React.CSSProperties}>
            <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-3">
                <h2 className="text-[15px] font-extrabold tracking-tight">Novedades</h2>
                <small className="text-[11.5px] text-muted-foreground">Lo que la biblioteca preparó para que compartas</small>
            </div>

            <div className="hoy-stories -mx-1 flex gap-4 overflow-x-auto px-1 pt-1.5 pb-1">
                {loading && !novedades.length && Array.from({ length: 5 }, (_, i) => (
                    <div key={i} className="grid w-[78px] shrink-0 justify-items-center gap-2">
                        <span className="hoy-skel size-[74px] rounded-full" />
                        <span className="hoy-skel h-2.5 w-12 rounded-full" />
                    </div>
                ))}

                {novedades.map(section => {
                    const Icon = TOOL_SECTION_ICON[section.key as keyof typeof TOOL_SECTION_ICON]
                    const isSeen = seen[section.key] === section.items[0]?.id
                    return (
                        <button key={section.key} type="button" onClick={() => setOpenKey(section.key)} className="grid w-[78px] shrink-0 cursor-pointer justify-items-center gap-1.5 text-center">
                            <span className={cn('hoy-ring', isSeen && 'seen')}>
                                <span style={section.cover ? { backgroundImage: `url("${section.cover}")` } : undefined}>
                                    {!section.cover && <Icon className="size-6 text-primary" />}
                                </span>
                                {!isSeen && section.today > 0 && <em>{section.today}</em>}
                            </span>
                            <span className="text-[11px] leading-tight font-semibold">{section.label}</span>
                        </button>
                    )
                })}

                {savedSection && (
                    <button type="button" onClick={() => setOpenKey(SAVED_SECTION)} className="grid w-[78px] shrink-0 cursor-pointer justify-items-center gap-1.5 text-center">
                        <span className="hoy-ring seen">
                            <span style={savedSection.cover ? { backgroundImage: `url("${savedSection.cover}")` } : undefined}>
                                {!savedSection.cover && <BookmarkIcon className="size-6 text-primary" />}
                            </span>
                            <em className="!bg-[#6C47FF]">{saved.length}</em>
                        </span>
                        <span className="text-[11px] leading-tight font-semibold">Guardados</span>
                    </button>
                )}

                {novedades.length > 0 && (
                    <button type="button" onClick={() => navigate(APP_ROUTES.TOOLS)} className="grid w-[78px] shrink-0 cursor-pointer justify-items-center gap-1.5 text-center">
                        <span className="hoy-ring seen">
                            <span><LibraryBigIcon className="size-6 text-primary" /></span>
                        </span>
                        <span className="text-[11px] leading-tight font-semibold">Ver todo</span>
                    </button>
                )}
            </div>

            {openKey && (
                <StoryViewer sections={viewerSections} startKey={openKey} onSeen={markSeen} onClose={() => setOpenKey(null)} />
            )}
        </section>
    )
}

export default NovedadesStories
