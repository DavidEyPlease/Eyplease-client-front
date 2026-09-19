import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { API_ROUTES } from '@/constants/api'
import { ApiResponse, PaginationResponse } from '@/interfaces/common'
import { ISavedTool } from '@/interfaces/tools'
import HttpService from '@/services/http'
import useAuthStore from '@/store/auth'

const SAVED_KEY = ['tools', 'saved']

/**
 * Guardados: lo que aparta de las Novedades para usarlo después. Son los MISMOS de la app (misma
 * API), así que lo que guarda en el teléfono aparece aquí y al revés. La lista completa cabe en
 * una página (tope de 200 en la API), y también sirve para saber qué piezas ya están guardadas.
 */
const useSavedTools = () => {
    const queryClient = useQueryClient()
    const ready = useAuthStore(state => !!state.user && !state.initialLoading)

    const query = useQuery({
        queryKey: SAVED_KEY,
        queryFn: async () => {
            const response = await HttpService.get<ApiResponse<PaginationResponse<ISavedTool>>>(`${API_ROUTES.TOOLS.SAVED}?perPage=200`)
            return response.data?.items ?? []
        },
        staleTime: 5 * 60 * 1000,
        retry: false,
        enabled: ready,
    })

    const saved = useMemo(() => query.data ?? [], [query.data])

    const savedByToolId = useMemo(() => {
        const map = new Map<string, ISavedTool>()
        saved.forEach(item => { if (item.tool_id) map.set(item.tool_id, item) })
        return map
    }, [saved])

    const save = useMutation({
        mutationFn: async (toolId: string) => {
            const response = await HttpService.post<ApiResponse<ISavedTool>>(API_ROUTES.TOOLS.SAVE.replace('{id}', toolId), {})
            return response.data
        },
        onSuccess: item => {
            if (!item) return
            queryClient.setQueryData<ISavedTool[]>(SAVED_KEY, (old = []) => [item, ...old.filter(entry => entry.id !== item.id)])
        },
    })

    const remove = useMutation({
        mutationFn: async (savedId: string) => {
            await HttpService.delete(API_ROUTES.TOOLS.REMOVE_SAVED.replace('{id}', savedId))
            return savedId
        },
        onSuccess: savedId => {
            queryClient.setQueryData<ISavedTool[]>(SAVED_KEY, (old = []) => old.filter(entry => entry.id !== savedId))
        },
    })

    return {
        saved,
        savedByToolId,
        save: save.mutateAsync,
        remove: remove.mutateAsync,
        busy: save.isPending || remove.isPending,
    }
}

export default useSavedTools
