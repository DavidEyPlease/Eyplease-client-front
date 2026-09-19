import { useMemo } from 'react'
import { useQueries, UseQueryResult } from '@tanstack/react-query'

import { useBillingEnforcement } from '@/components/billing/enforcement/context'
import { API_ROUTES } from '@/constants/api'
import useAuth from '@/hooks/useAuth'
import { BillingRestrictedFeature } from '@/interfaces/billing'
import { ApiResponse, PaginationResponse } from '@/interfaces/common'
import { PermissionKeys } from '@/interfaces/permissions'
import { ITool, ToolSectionTypes } from '@/interfaces/tools'
import { TOOL_SECTIONS_ORDER } from '@/pages/Tools/utils'
import HttpService from '@/services/http'
import useAuthStore from '@/store/auth'
import { isImage } from '@/utils'

/** En un anillo no cabe «Publicación de Redes Sociales»: aquí van los nombres cortos, los de la app. */
export const NOVEDADES_LABELS: Record<ToolSectionTypes, string> = {
    [ToolSectionTypes.PROPOSALS]: 'Propuestas',
    [ToolSectionTypes.PRODUCTS]: 'Productos',
    [ToolSectionTypes.GET_STARTED]: 'Inicia',
    [ToolSectionTypes.STAY_INFORMED]: 'Entérate Ya',
    [ToolSectionTypes.LEARN]: 'Publicaciones',
    [ToolSectionTypes.EXPLAIN]: 'Historias',
}

/** Lo mínimo que el visor necesita de una pieza: lo cumplen la biblioteca y los guardados. */
export type StoryItem = Pick<ITool, 'id' | 'title' | 'files' | 'created_at'>

/** Clave de la sección de guardados: no es de la biblioteca, así que no abre en ella. */
export const SAVED_SECTION = 'saved'

export interface NovedadesSection {
    key: ToolSectionTypes | typeof SAVED_SECTION
    label: string
    items: StoryItem[]
    /** Imagen con la que se pinta el anillo: la primera pieza con imagen de la sección */
    cover: string | null
    /** Cuántas son de hoy: es el número que lleva el anillo */
    today: number
}

const STALE_MS = 5 * 60 * 1000

const isToday = (date: Date | string) => new Date(date).toDateString() === new Date().toDateString()

const combine = (results: UseQueryResult<ITool[]>[]) => ({
    itemsBySection: results.map(result => result.data ?? []),
    loading: results.some(result => result.isLoading),
})

/**
 * Novedades = la biblioteca por sección, una petición por sección (la API pagina por sección).
 * Sólo se piden las secciones que el plan trae; Propuestas además pasa por la puerta de cobranza.
 */
const useNovedades = () => {
    const { hasAccess } = useAuth()
    const user = useAuthStore(state => state.user)
    const initialLoading = useAuthStore(state => state.initialLoading)
    const { isFeatureRestricted } = useBillingEnforcement()
    const proposalsRestricted = isFeatureRestricted(BillingRestrictedFeature.LIBRARY_PROPOSALS)

    const sections = useMemo(
        () => TOOL_SECTIONS_ORDER.filter(section => {
            if (!hasAccess(section.toString() as PermissionKeys)) return false
            return !(section === ToolSectionTypes.PROPOSALS && proposalsRestricted)
        }),
        // `hasAccess` se recrea en cada pintado; lo que de verdad cambia es el plan del usuario
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [user, proposalsRestricted],
    )

    const { itemsBySection, loading } = useQueries({
        queries: sections.map(section => ({
            queryKey: ['hoy', 'novedades', section],
            queryFn: async () => {
                const response = await HttpService.get<ApiResponse<PaginationResponse<ITool>>>(`${API_ROUTES.TOOLS.LIST}?section=${section}`)
                return response.data?.items ?? []
            },
            staleTime: STALE_MS,
            enabled: !!user && !initialLoading,
        })),
        combine,
    })

    const novedades = useMemo<NovedadesSection[]>(
        () => sections
            .map((section, index) => {
                const items = (itemsBySection[index] ?? []).filter(item => item.files.length > 0)
                const firstImage = items.flatMap(item => item.files).find(file => isImage(file.ext))
                return {
                    key: section,
                    label: NOVEDADES_LABELS[section],
                    items,
                    cover: firstImage?.url ?? null,
                    today: items.filter(item => isToday(item.created_at)).length,
                }
            })
            .filter(section => section.items.length > 0),
        [sections, itemsBySection],
    )

    return { novedades, loading, hasLibrary: sections.length > 0 }
}

export default useNovedades
