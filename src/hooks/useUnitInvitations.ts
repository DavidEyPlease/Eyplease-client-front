import { useQuery } from '@tanstack/react-query'

import { API_ROUTES } from '@/constants/api'
import { ApiResponse } from '@/interfaces/common'
import { UnitInvitationsResponse } from '@/interfaces/invitations'
import HttpService from '@/services/http'
import useAuthStore from '@/store/auth'
import { companyCan } from '@/utils/company'

export const UNIT_INVITATIONS_KEY = ['unit', 'invitations']

/** «Invitar con regalo»: su unidad con el estado de cada invitación y los totales (sólo Directoras de paga). */
const useUnitInvitations = (enabled = true) => {
    // Sólo si su empresa tiene «Invitar con regalo» (si no, la API responde 403 y no hay nada que pedir)
    const ready = useAuthStore(state => enabled && !!state.user && !state.initialLoading && companyCan(state.user, 'gift_invites'))

    return useQuery({
        queryKey: UNIT_INVITATIONS_KEY,
        queryFn: async () => (await HttpService.get<ApiResponse<UnitInvitationsResponse>>(API_ROUTES.UNIT.INVITATIONS)).data ?? null,
        staleTime: 2 * 60 * 1000,
        retry: false,
        enabled: ready,
    })
}

export default useUnitInvitations
