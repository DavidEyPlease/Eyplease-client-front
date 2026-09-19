import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'
import { ArrowRightIcon } from 'lucide-react'

import { APP_ROUTES, MAP_MAIN_POSTS_SECTIONS } from '@/constants/app'
import { MainPostSectionTypes, PostSectionTypes } from '@/interfaces/posts'
import { cn } from '@/lib/utils'
import { usePostsStore } from '@/store/posts'
import useUnitToday, { UnitGroup } from '../hooks/useUnitToday'
import UnitGroupCard from './UnitGroupCard'

/** Cada ámbito con su nombre: una consultora no tiene unidad, ve a sus clientas. */
const SCOPES: Record<MainPostSectionTypes, { title: string, empty: string }> = {
    [MainPostSectionTypes.UNITY]: { title: 'Mi unidad', empty: 'Hoy no hay reconocimientos nuevos en tu unidad.' },
    [MainPostSectionTypes.DIRECTORS]: { title: 'Mis Directoras', empty: 'Hoy no hay reconocimientos nuevos de tus Directoras.' },
    [MainPostSectionTypes.CLIENTS]: { title: 'Mis clientas', empty: 'Hoy no hay piezas nuevas de tus clientas.' },
}

/** Lo vivo va primero porque es lo que cambia hoy; el cierre es el lote del mes anterior. */
const STAGES: Array<{ key: UnitGroup['stage'], title: (month: string) => string }> = [
    { key: 'live', title: () => 'Publicaciones en vivo' },
    { key: 'closed', title: month => month ? `Al cierre de ${month}` : 'Al cierre del mes anterior' },
]

/** Cuántos días anteriores se enseñan antes de mandar a la pantalla completa. */
const PREVIOUS_SHOWN = 3

const Divider = ({ children }: { children: React.ReactNode }) => (
    <div className="flex items-center gap-3 px-1 text-[11px] font-bold tracking-wide text-muted-foreground uppercase">
        <span className="h-px flex-1 bg-border" />{children}<span className="h-px flex-1 bg-border" />
    </div>
)

const groupId = (group: UnitGroup) => `${group.key}-${group.stage}-${group.day}`
const piecesOf = (groups: UnitGroup[]) => groups.reduce((sum, group) => sum + group.pieces.length, 0)

interface Props {
    feed: ReturnType<typeof useUnitToday>
    chip: string
    onChip: (chip: string) => void
    index?: number
}

/** El feed del Hoy: lo publicado hoy, por sección; lo anterior se pliega y vive completo en Mi unidad. */
const UnitFeed = ({ feed, chip, onChip, index = 0 }: Props) => {
    const navigate = useNavigate()
    const setPostFilters = usePostsStore(state => state.setFilters)
    const { groups, todayGroups, previousGroups, loading, patchPost, mainSection, scopes, setMainSection, sections } = feed

    const copy = SCOPES[mainSection] ?? SCOPES[MainPostSectionTypes.UNITY]
    const chips = sections
        .map(section => ({ key: section.key.toString(), label: section.label, count: piecesOf(groups.filter(group => group.key === section.key.toString())) }))
        .filter(item => item.count > 0)

    /* Una sección elegida que ya no tiene nada (cambió de ámbito) no deja el feed en blanco */
    const active = chip !== 'all' && chips.some(item => item.key === chip) ? chip : 'all'
    const today = todayGroups
    const sectionGroups = active === 'all' ? [] : groups.filter(group => group.key === active)

    /* Si la sección se eligió desde fuera (la columna del seguimiento), su chip puede quedar
       escondido a la derecha de la fila: se trae a la vista sin mover la página. */
    const chipsRow = useRef<HTMLDivElement>(null)
    useEffect(() => {
        const row = chipsRow.current
        const target = row?.querySelector<HTMLElement>('[data-active="true"]')
        if (!row || !target) return
        row.scrollTo({ left: target.offsetLeft - (row.clientWidth - target.offsetWidth) / 2, behavior: 'smooth' })
    }, [active])

    const openAll = (section?: string) => {
        setPostFilters({ post_type: mainSection, section: (section ?? sections[0]?.key.toString()) as PostSectionTypes })
        navigate(APP_ROUTES.POSTS.LIST)
    }

    const card = (group: UnitGroup, position: number) => (
        <UnitGroupCard key={groupId(group)} group={group} patchPost={patchPost} index={index + 2 + Math.min(position, 4)} />
    )

    return (
        <section className="grid grid-cols-1 gap-4">
            <div className="hoy-rise flex flex-wrap items-center justify-between gap-2" style={{ '--i': index } as React.CSSProperties}>
                <h2 className="text-[15px] font-extrabold tracking-tight">{copy.title}</h2>
                {scopes.length > 1 && (
                    <div className="inline-flex rounded-xl bg-foreground/5 p-[3px]">
                        {scopes.map(scope => (
                            <button
                                key={scope}
                                type="button"
                                onClick={() => { setMainSection(scope); onChip('all') }}
                                className={cn('h-7 cursor-pointer rounded-[9px] px-3 text-[11.5px] font-bold transition-colors', scope === mainSection ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}
                            >
                                {MAP_MAIN_POSTS_SECTIONS[scope]}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {chips.length > 1 && (
                <div ref={chipsRow} className="hoy-stories hoy-rise relative -mt-1.5 flex gap-1.5 overflow-x-auto p-0.5" style={{ '--i': index + 1 } as React.CSSProperties}>
                    {[{ key: 'all', label: 'Todo', count: piecesOf(groups) }, ...chips].map(item => (
                        <button
                            key={item.key}
                            type="button"
                            data-active={active === item.key}
                            onClick={() => onChip(item.key)}
                            className={cn(
                                'inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 text-[12.5px] font-semibold transition-colors',
                                active === item.key ? 'border-transparent bg-foreground text-background' : 'border-border bg-card/70 text-muted-foreground hover:border-[#6C47FF]/40 hover:text-foreground',
                            )}
                        >
                            {item.label} <b className="text-[11px] font-extrabold opacity-70">{item.count}</b>
                        </button>
                    ))}
                </div>
            )}

            {loading && !groups.length && (
                <div className="shell-glass overflow-hidden rounded-[22px]">
                    <div className="flex items-center gap-2.5 px-4 py-3.5">
                        <span className="hoy-skel size-[38px] rounded-[13px]" />
                        <span className="grid flex-1 gap-1.5"><span className="hoy-skel h-3 w-32 rounded-full" /><span className="hoy-skel h-2.5 w-20 rounded-full" /></span>
                    </div>
                    <div className="hoy-skel aspect-4/5" />
                </div>
            )}

            {/* Con una sección elegida sale ENTERA, partida en lo que se mueve y lo que ya cerró:
                hablan de meses distintos y mezcladas se leían como repetidas */}
            {active !== 'all' ? (
                STAGES.map(stage => {
                    const list = sectionGroups.filter(group => group.stage === stage.key)
                    if (!list.length) return null
                    const months = new Set(list.map(group => group.month))
                    return (
                        <div key={stage.key} className="grid grid-cols-1 gap-4">
                            <Divider>{stage.title(months.size === 1 ? [...months][0] : '')} · {piecesOf(list)}</Divider>
                            {list.map(card)}
                        </div>
                    )
                })
            ) : (
                <>
                    {!loading && !today.length && (
                        <p className="shell-glass hoy-rise rounded-[22px] px-5 py-8 text-center text-[13px] text-muted-foreground" style={{ '--i': index + 2 } as React.CSSProperties}>
                            {groups.length ? copy.empty : 'Todavía no hay publicaciones este mes. En cuanto se carguen tus reportes, aquí aparecen.'}
                        </p>
                    )}

                    {today.map(card)}

                    {previousGroups.length > 0 && (
                        <>
                            <Divider>Días anteriores · {piecesOf(previousGroups)}</Divider>
                            {previousGroups.slice(0, PREVIOUS_SHOWN).map(card)}
                            {previousGroups.length > PREVIOUS_SHOWN && (
                                <button type="button" onClick={() => openAll()} className="flex cursor-pointer items-center justify-center gap-1.5 py-1 text-[12.5px] font-bold text-primary hover:underline">
                                    Ver todo el mes en {copy.title} <ArrowRightIcon className="size-3.5" />
                                </button>
                            )}
                        </>
                    )}
                </>
            )}
        </section>
    )
}

export default UnitFeed
