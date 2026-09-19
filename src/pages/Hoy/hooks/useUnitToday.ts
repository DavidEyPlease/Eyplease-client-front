import { useMemo, useState } from 'react'

import { IPost, MainPostSectionTypes } from '@/interfaces/posts'
import usePostSections from '@/pages/Posts/hooks/usePostSections'
import { getPostDate, groupPostVersions, isPostLive, PostVersionGroup } from '@/pages/Posts/lib'
import useSectionPosts from './useSectionPosts'

export interface UnitGroup {
    key: string
    label: string
    /** Día del grupo (YYYY-MM-DD, hora local) */
    day: string
    isToday: boolean
    /** En vivo (pasó ese día) o del lote del cierre de mes */
    stage: 'live' | 'closed'
    /** Mes de los DATOS cuando todo el grupo es del mismo («agosto»); vacío si se mezclan */
    month: string
    /** Una pieza por noticia: las versiones A/B de la misma consultora van juntas */
    pieces: PostVersionGroup[]
    withoutPhoto: number
    shared: number
}

export const dayKey = (date: Date | string) => {
    const d = new Date(date)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Se parte la cadena en vez de pasarla a `new Date`: un `YYYY-MM-DD` es UTC y en México cae el día anterior. */
const monthNameOf = (fecha: string): string => {
    const [anio, mes] = fecha.split('-').map(Number)
    if (!anio || !mes) return ''
    return new Date(anio, mes - 1, 1).toLocaleDateString('es-MX', { month: 'long' })
}

/**
 * Parte las publicaciones de UNA sección en tarjetas: una por tramo (en vivo / cierre) y día,
 * con las versiones de cada consultora juntas. Mismo criterio que el Hoy de la app.
 */
export const buildUnitGroups = (key: string, label: string, posts: IPost[], today: string): UnitGroup[] => {
    /* Lo vivo se fecha por el día en que pasó; el lote del cierre, por el día en que se generó.
       Se separan aunque caigan el mismo día: hablan de meses distintos y juntas se leen repetidas. */
    const buckets: Record<string, IPost[]> = {}
    posts.forEach(post => {
        const live = isPostLive(post)
        const day = dayKey(live && post.live_event_at ? post.live_event_at : getPostDate(post))
        const bucket = `${live ? 'live' : 'closed'}|${day}`
        ;(buckets[bucket] = buckets[bucket] || []).push(post)
    })

    return Object.entries(buckets).map(([bucket, items]) => {
        const [stage, day] = bucket.split('|') as [UnitGroup['stage'], string]
        const pieces = groupPostVersions(items)
        const months = new Set(items.map(post => post.newsletter_date ?? ''))
        return {
            key,
            label,
            day,
            isToday: day === today,
            stage,
            month: months.size === 1 ? monthNameOf([...months][0]) : '',
            pieces,
            /* Por consultora, no por versión: a quien le falta la foto le falta UNA aunque tenga dos diseños */
            withoutPhoto: pieces.filter(piece => piece.versions[0].has_photo === false && !!piece.versions[0].vendorable).length,
            shared: pieces.filter(piece => piece.versions.some(version => !!version.shared_at)).length,
        }
    })
}

/**
 * El feed del Hoy: lo publicado en cada sección, agrupado por sección y día. Lo de hoy va
 * primero y, dentro de cada día, lo que espera una foto sube al principio.
 */
const useUnitToday = () => {
    const [chosen, setMainSection] = useState<MainPostSectionTypes | null>(null)
    const { mainSections } = usePostSections(chosen ?? MainPostSectionTypes.UNITY)

    /* Sin elegir, el primer ámbito que el plan traiga: una consultora no tiene unidad, ve a sus clientas */
    const scopes = useMemo(() => mainSections.map(access => access.permission_key.toString() as MainPostSectionTypes), [mainSections])
    const mainSection = chosen && scopes.includes(chosen) ? chosen : scopes[0] ?? MainPostSectionTypes.UNITY

    const { sections, postsBySection, loading, patchPost } = useSectionPosts(mainSection)
    const today = dayKey(new Date())

    const groups = useMemo(() => {
        const out: UnitGroup[] = []
        sections.forEach((section, index) => {
            out.push(...buildUnitGroups(section.key.toString(), section.label, postsBySection[index] ?? [], today))
        })
        return out.sort((a, b) =>
            b.day.localeCompare(a.day)
            || Number(b.withoutPhoto > 0) - Number(a.withoutPhoto > 0)
            || b.pieces.length - a.pieces.length,
        )
    }, [sections, postsBySection, today])

    return {
        groups,
        todayGroups: groups.filter(group => group.isToday),
        previousGroups: groups.filter(group => !group.isToday),
        loading,
        patchPost,
        mainSection,
        scopes,
        setMainSection,
        sections,
    }
}

export default useUnitToday
