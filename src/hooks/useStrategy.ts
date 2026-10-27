import { useQuery } from '@tanstack/react-query'

import { API_ROUTES } from '@/constants/api'
import { ApiResponse } from '@/interfaces/common'
import { ConsultantStrategy } from '@/interfaces/strategy'
import HttpService from '@/services/http'
import useAuthStore from '@/store/auth'
import { STRATEGY_KEY } from './useInventory'

/**
 * Su estrategia del mes (`GET consultant/strategy`). La API la arma cada vez con su inventario y sus ventas, así que
 * al anotar una venta o corregir el inventario se vuelve a pedir (`useInventory` invalida esta llave).
 */
const useStrategy = (enabled = true) => {
    const ready = useAuthStore(state => enabled && !!state.user && !state.initialLoading)
    return useQuery({
        queryKey: STRATEGY_KEY,
        queryFn: async () => (await HttpService.get<ApiResponse<ConsultantStrategy>>(API_ROUTES.CONSULTANT.STRATEGY)).data,
        staleTime: 2 * 60 * 1000,
        retry: 1,
        enabled: ready,
    })
}

export default useStrategy
