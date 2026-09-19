import { useMemo, useState } from 'react'
import { Navigate } from 'react-router'
import { SearchIcon } from 'lucide-react'

import Modal from '@/components/common/Modal'
import { APP_ROUTES } from '@/constants/app'
import { IPost, MainPostSectionTypes } from '@/interfaces/posts'
import { isNewShell } from '@/layouts/TopShell/useNewShell'
import { cn } from '@/lib/utils'
import UnitGroupCard from '@/pages/Hoy/components/UnitGroupCard'
import '@/pages/Hoy/hoy.css'
import useSectionPosts from '@/pages/Hoy/hooks/useSectionPosts'
import { buildUnitGroups, dayKey } from '@/pages/Hoy/hooks/useUnitToday'
import { titleCaseName } from '@/pages/Hoy/lib'
import { groupPostVersions } from '@/pages/Posts/lib'

const TAG = 'inline-flex h-[22px] items-center rounded-full px-2.5 text-[10.5px] font-bold tracking-wide whitespace-nowrap'

type Filter = 'all' | 'unsent' | 'no-photo'
const FILTERS: Array<{ key: Filter, label: string }> = [
    { key: 'all', label: 'Todas' },
    { key: 'unsent', label: 'Sin compartir' },
    { key: 'no-photo', label: 'Sin foto' },
]

interface Person {
    id: string
    name: string
    /** Sus publicaciones, con la sección de cada una */
    posts: Array<{ post: IPost, section: string, label: string }>
    /** Por noticia, no por versión: dos diseños de la misma noticia cuentan una vez */
    pieces: number
    unsent: number
    noPhoto: boolean
    labels: string[]
}

const initials = (name: string) => name.trim().split(/\s+/).slice(0, 2).map(word => word[0]?.toUpperCase() ?? '').join('')

/**
 * Mi unidad, por persona: cada consultora con lo que logró este mes y lo que todavía no se le
 * comparte. Sale de las mismas publicaciones del Hoy (misma caché), agrupadas por ella en vez de
 * por sección; al abrirla salen sus piezas con las acciones de siempre.
 */
const MyUnitPage = () => {
    const { sections, postsBySection, loading, patchPost } = useSectionPosts(MainPostSectionTypes.UNITY)
    const [filter, setFilter] = useState<Filter>('all')
    const [search, setSearch] = useState('')
    const [openId, setOpenId] = useState<string | null>(null)

    const people = useMemo(() => {
        const byId = new Map<string, Person>()
        sections.forEach((section, index) => {
            for (const post of postsBySection[index] ?? []) {
                if (!post.vendorable) continue
                const person = byId.get(post.vendorable.id) ?? { id: post.vendorable.id, name: post.vendorable.name, posts: [], pieces: 0, unsent: 0, noPhoto: false, labels: [] }
                person.posts.push({ post, section: section.key.toString(), label: section.label })
                byId.set(person.id, person)
            }
        })

        for (const person of byId.values()) {
            const pieces = groupPostVersions(person.posts.map(entry => entry.post))
            person.pieces = pieces.length
            person.unsent = pieces.filter(piece => !piece.versions.some(version => !!version.shared_at)).length
            person.noPhoto = person.posts.some(entry => entry.post.has_photo === false)
            person.labels = [...new Set(person.posts.map(entry => entry.label))]
        }

        /* Primero a quien más se le debe: es la lista de pendientes, no un directorio */
        return [...byId.values()].sort((a, b) => b.unsent - a.unsent || b.pieces - a.pieces || a.name.localeCompare(b.name))
    }, [sections, postsBySection])

    /* La página nace con el marco nuevo: con el de siempre esto es Publicaciones */
    if (!isNewShell()) return <Navigate to={APP_ROUTES.POSTS.LIST} replace />

    const term = search.trim().toLocaleLowerCase('es-MX')
    const visible = people.filter(person =>
        (filter === 'all' || (filter === 'unsent' ? person.unsent > 0 : person.noPhoto))
        && (!term || person.name.toLocaleLowerCase('es-MX').includes(term)),
    )

    const opened = people.find(person => person.id === openId) ?? null
    const today = dayKey(new Date())
    const openedGroups = opened
        ? sections.flatMap(section => buildUnitGroups(
            section.key.toString(),
            section.label,
            opened.posts.filter(entry => entry.section === section.key.toString()).map(entry => entry.post),
            today,
        )).sort((a, b) => b.day.localeCompare(a.day))
        : []

    const unsentPeople = people.filter(person => person.unsent > 0).length

    return (
        <div className="grid grid-cols-1 gap-4">
            <header className="hoy-rise flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="text-[10.5px] font-extrabold tracking-[.14em] text-[#6C47FF] uppercase dark:text-[#A894FF]">Mi negocio</p>
                    <h1 className="hoy-title mt-1 text-[28px] leading-[1.1] font-extrabold tracking-tight">Mi unidad · <em>{people.length} con reconocimientos</em></h1>
                    <p className="mt-1.5 max-w-[62ch] text-[13.5px] text-muted-foreground">
                        Cada consultora, lo que logró este mes y lo que todavía no le compartes.
                        {unsentPeople > 0 && <> A <b className="text-foreground">{unsentPeople}</b> {unsentPeople === 1 ? 'le falta' : 'les falta'} recibir algo tuyo.</>}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <label className="flex h-9 items-center gap-2 rounded-xl border border-border bg-card/60 px-3 text-[12.5px] focus-within:border-[#6C47FF]/50">
                        <SearchIcon className="size-[15px] text-muted-foreground" />
                        <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscar por nombre" className="w-36 bg-transparent outline-none placeholder:text-muted-foreground" />
                    </label>
                    <div className="inline-flex rounded-xl bg-foreground/5 p-[3px]">
                        {FILTERS.map(item => (
                            <button key={item.key} type="button" onClick={() => setFilter(item.key)} className={cn('h-[30px] cursor-pointer rounded-[9px] px-3 text-[12px] font-bold transition-colors', filter === item.key ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {loading && !people.length ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: 6 }, (_, index) => <span key={index} className="hoy-skel h-[92px] rounded-[20px]" />)}
                </div>
            ) : visible.length === 0 ? (
                <p className="shell-glass hoy-rise rounded-[22px] px-5 py-10 text-center text-[13px] text-muted-foreground">
                    {people.length === 0 ? 'Todavía no hay reconocimientos este mes. En cuanto se carguen tus reportes, aquí aparece tu unidad.' : 'Nadie con ese filtro.'}
                </p>
            ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {visible.map((person, index) => (
                        <button
                            key={person.id}
                            type="button"
                            onClick={() => setOpenId(person.id)}
                            className="shell-glass hoy-rise flex cursor-pointer items-center gap-3 rounded-[20px] p-3.5 text-left transition-[transform,border-color] duration-300 hover:-translate-y-0.5 hover:border-[#6C47FF]/40"
                            style={{ '--i': Math.min(index, 14) } as React.CSSProperties}
                        >
                            <span className="hoy-soft grid size-12 shrink-0 place-items-center rounded-2xl text-[14px] font-extrabold text-primary">{initials(person.name)}</span>
                            <span className="min-w-0 flex-1">
                                <b className="block truncate text-[13.5px] font-extrabold">{titleCaseName(person.name)}</b>
                                <small className="block truncate text-[11.5px] text-muted-foreground">{person.labels.slice(0, 2).join(' · ')}{person.labels.length > 2 ? ` +${person.labels.length - 2}` : ''}</small>
                                <span className="mt-1.5 flex flex-wrap gap-1.5">
                                    <span className={cn(TAG, 'bg-[#6C47FF]/10 text-[#6C47FF] dark:text-[#BBAAFF]')}>{person.pieces} {person.pieces === 1 ? 'pieza' : 'piezas'}</span>
                                    {person.unsent > 0
                                        ? <span className={cn(TAG, 'bg-amber-500/15 text-amber-700 dark:text-amber-400')}>{person.unsent} sin compartir</span>
                                        : <span className={cn(TAG, 'bg-emerald-500/14 text-emerald-700 dark:text-emerald-400')}>al día</span>}
                                    {person.noPhoto && <span className={cn(TAG, 'bg-foreground/5 text-muted-foreground')}>sin foto</span>}
                                </span>
                            </span>
                        </button>
                    ))}
                </div>
            )}

            <Modal open={!!opened} size="lg" title={opened ? titleCaseName(opened.name) : ''} description={opened ? `${opened.pieces} ${opened.pieces === 1 ? 'pieza' : 'piezas'} este mes${opened.unsent ? ` · ${opened.unsent} sin compartir` : ' · todo compartido'}` : undefined} onOpenChange={open => { if (!open) setOpenId(null) }}>
                <div className="hoy-rail -mx-1 grid max-h-[70vh] grid-cols-1 gap-4 overflow-y-auto px-1 pb-1">
                    {openedGroups.map(group => <UnitGroupCard key={`${group.key}-${group.stage}-${group.day}`} group={group} patchPost={patchPost} />)}
                </div>
            </Modal>
        </div>
    )
}

export default MyUnitPage
