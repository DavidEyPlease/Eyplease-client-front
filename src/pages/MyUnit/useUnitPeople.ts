import { QueryClient, useQuery } from '@tanstack/react-query'

import { API_ROUTES } from '@/constants/api'
import { ApiResponse, Gender } from '@/interfaces/common'
import HttpService from '@/services/http'

/** Lo único que se usa en la web del directorio de la unidad (GET /unit/people trae mucho más) */
export interface UnitPerson {
    id: string
    gender: Gender | null
    /** El apodo que le puso esta Directora (sólo su seguimiento); null si no tiene */
    nickname?: string | null
}

export const UNIT_PEOPLE_KEY = ['unit', 'people']

/**
 * El directorio de la unidad: de aquí salen el sexo y el apodo de cada consultora, porque las publicaciones (con las
 * que se arma Mi unidad) no los traen. Si alguien no está (alguien del Área) o falla, simplemente no hay dato.
 */
const useUnitPeople = (enabled = true) => useQuery({
    queryKey: UNIT_PEOPLE_KEY,
    queryFn: async () => (await HttpService.get<ApiResponse<{ people: UnitPerson[] }>>(API_ROUTES.UNIT.PEOPLE)).data?.people ?? [],
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: false,
})

/**
 * Al guardar a una consultora (en Mi unidad o en Galería): su sexo y su apodo nuevos en el directorio, sin volver a
 * pedirlo; y la tabla de los retos se vuelve a pedir la próxima vez que se abra, para que salga con su apodo.
 */
export const patchUnitPerson = (queryClient: QueryClient, id: string, updated: { gender?: Gender | null, nickname?: string | null }) => {
    queryClient.setQueryData<UnitPerson[]>(UNIT_PEOPLE_KEY, current => {
        if (!current) return current
        const nickname = 'nickname' in updated ? { nickname: updated.nickname ?? null } : {}
        if (!current.some(item => item.id === id)) return 'nickname' in updated ? [...current, { id, gender: updated.gender ?? null, ...nickname }] : current
        return current.map(item => item.id === id ? { ...item, gender: updated.gender ?? item.gender, ...nickname } : item)
    })
    queryClient.invalidateQueries({ queryKey: ['challenges'], refetchType: 'none' })
}

export default useUnitPeople
