import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { API_ROUTES } from '@/constants/api'
import { ChallengeList, ChallengeSuggestion, IChallenge, NewChallenge } from '@/interfaces/challenges'
import { ApiResponse } from '@/interfaces/common'
import HttpService from '@/services/http'
import useAuthStore from '@/store/auth'

const LIST_KEY = ['challenges']
const detailKey = (id: string) => ['challenges', id]

/** Lo que el Asistente le propone hoy, calculado en la API con sus propios números. */
export const fetchChallengeSuggestions = async () => {
    const response = await HttpService.get<ApiResponse<ChallengeSuggestion[]>>(API_ROUTES.CHALLENGES.SUGGESTIONS)
    return response.data ?? []
}

/**
 * Retos de la Directora: los suyos (los propone el Asistente) y los que pone a su unidad. Es el
 * mismo contrato que usa la app. El avance no se guarda en ningún lado: la API lo calcula cada
 * vez desde ventas, corazones y lo compartido.
 */
const useChallenges = () => {
    const queryClient = useQueryClient()
    const ready = useAuthStore(state => !!state.user && !state.initialLoading)

    const query = useQuery({
        queryKey: LIST_KEY,
        queryFn: async () => {
            const response = await HttpService.get<ApiResponse<ChallengeList>>(API_ROUTES.CHALLENGES.LIST)
            return response.data ?? { personal: [], unit: [] }
        },
        staleTime: 2 * 60 * 1000,
        retry: false,
        enabled: ready,
    })

    const refresh = (challenge?: IChallenge | null) => {
        if (challenge) queryClient.setQueryData(detailKey(challenge.id), challenge)
        return queryClient.invalidateQueries({ queryKey: LIST_KEY, exact: true })
    }

    const create = useMutation({
        mutationFn: async (data: NewChallenge) => {
            const response = await HttpService.post<ApiResponse<IChallenge>>(API_ROUTES.CHALLENGES.LIST, data)
            return response.data
        },
        onSuccess: refresh,
    })

    const award = useMutation({
        mutationFn: async ({ id, personId }: { id: string, personId: string }) => {
            const response = await HttpService.post<ApiResponse<IChallenge>>(API_ROUTES.CHALLENGES.AWARD.replace('{id}', id), { person_id: personId })
            return response.data
        },
        onSuccess: refresh,
    })

    const remove = useMutation({
        mutationFn: async (id: string) => {
            await HttpService.delete(API_ROUTES.CHALLENGES.DETAIL.replace('{id}', id))
            return id
        },
        onSuccess: id => {
            queryClient.removeQueries({ queryKey: detailKey(id) })
            return refresh()
        },
    })

    return {
        personal: query.data?.personal ?? [],
        unit: query.data?.unit ?? [],
        loading: query.isLoading,
        /** La API de retos no respondió: la pantalla no ofrece crear */
        unavailable: query.isError,
        create: create.mutateAsync,
        creating: create.isPending,
        award: award.mutateAsync,
        awardingId: award.isPending ? award.variables?.personId ?? null : null,
        remove: remove.mutateAsync,
        removing: remove.isPending,
    }
}

/** Un reto con su tabla por persona. */
export const useChallengeDetail = (id: string | null) => useQuery({
    queryKey: detailKey(id ?? 'none'),
    queryFn: async () => {
        const response = await HttpService.get<ApiResponse<IChallenge>>(API_ROUTES.CHALLENGES.DETAIL.replace('{id}', id as string))
        return response.data ?? null
    },
    enabled: !!id,
    staleTime: 60 * 1000,
    retry: false,
})

export default useChallenges
