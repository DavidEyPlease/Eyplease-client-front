import { useCallback, useMemo } from 'react'
import { useQueries, useQueryClient, UseQueryResult } from '@tanstack/react-query'

import { useBillingEnforcement } from '@/components/billing/enforcement/context'
import { API_ROUTES } from '@/constants/api'
import { ApiResponse, PaginationResponse } from '@/interfaces/common'
import { BillingRestrictedFeature } from '@/interfaces/billing'
import { IPost, MainPostSectionTypes, PostSectionTypes } from '@/interfaces/posts'
import usePostSections from '@/pages/Posts/hooks/usePostSections'
import HttpService from '@/services/http'
import useAuthStore from '@/store/auth'

/** Raíz de la caché del Hoy: `['hoy', 'unidad', ámbito, sección]`. */
export const HOY_POSTS_KEY = ['hoy', 'unidad'] as const

const STALE_MS = 2 * 60 * 1000
const REGENERATING_POLL_MS = 8000
/** Se pide la sección entera: con la página por defecto Círculo Rosa salía a medias. */
const PER_PAGE = 80

const BIRTHDAY_SECTIONS: string[] = [
    PostSectionTypes.BIRTHDAYS,
    PostSectionTypes.NATIONAL_BIRTHDAYS,
    PostSectionTypes.CUSTOMER_BIRTHDAYS,
]

/* Fuera del componente para que sea estable: así `useQueries` sólo recalcula cuando cambia
   alguna consulta, y quien dependa de `postsBySection` no se recalcula en cada pintado. */
const combine = (results: UseQueryResult<IPost[]>[]) => ({
    postsBySection: results.map(result => result.data ?? []),
    loading: results.some(result => result.isLoading),
})

/**
 * Las publicaciones del mes de un ámbito (unidad, directoras, clientas): una petición por
 * sección que el plan trae. Es el mismo reparto que usa la app en su Hoy.
 *
 * Van en su propia caché y no en la de Publicaciones porque aquélla es una lista paginada
 * de UNA sección; aquí hacen falta todas a la vez para poder ordenarlas por día.
 */
const useSectionPosts = (mainSection: MainPostSectionTypes) => {
    const queryClient = useQueryClient()
    const user = useAuthStore(state => state.user)
    const initialLoading = useAuthStore(state => state.initialLoading)
    const { sections } = usePostSections(mainSection)
    const { isFeatureRestricted } = useBillingEnforcement()

    /* Con cumpleaños cerrados por cobranza no se piden: la API respondería 403 igual */
    const birthdaysRestricted = isFeatureRestricted(BillingRestrictedFeature.BIRTHDAY_POSTS)
    const askable = useMemo(
        () => sections.filter(section => !(birthdaysRestricted && BIRTHDAY_SECTIONS.includes(section.key.toString()))),
        [sections, birthdaysRestricted],
    )

    const { postsBySection, loading } = useQueries({
        queries: askable.map(section => ({
            queryKey: [...HOY_POSTS_KEY, mainSection, section.key.toString()],
            queryFn: async () => {
                const params = new URLSearchParams({
                    post_type: mainSection,
                    section: section.key.toString(),
                    perPage: String(PER_PAGE),
                })
                const response = await HttpService.get<ApiResponse<PaginationResponse<IPost>>>(`${API_ROUTES.POSTS.LIST}?${params}`)
                return response.data?.items ?? []
            },
            staleTime: STALE_MS,
            enabled: !!user && !initialLoading,
            /* Mientras haya una pieza generándose se vuelve a preguntar: la imagen tarda segundos */
            refetchInterval: (query: { state: { data?: IPost[] } }) =>
                (query.state.data ?? []).some(post => post.is_regenerating) ? REGENERATING_POLL_MS : false,
        })),
        combine,
    })

    /** Actualiza una publicación en TODAS las consultas del Hoy (la misma puede estar en dos ámbitos). */
    const patchPost = useCallback((itemId: string, data: Partial<IPost>) => {
        queryClient.setQueriesData<IPost[]>({ queryKey: HOY_POSTS_KEY }, current =>
            current?.map(item => item.id === itemId ? { ...item, ...data } : item),
        )
    }, [queryClient])

    return {
        sections: askable,
        /** Publicaciones por sección, en el mismo orden que `sections` */
        postsBySection,
        loading,
        patchPost,
    }
}

export default useSectionPosts
