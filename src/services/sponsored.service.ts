import HttpService from '@/services/http'
import { API_ROUTES } from '@/constants/api'
import { ApiResponse, AutocompleteOption } from '@/interfaces/common'
import { ISponsored, ISponsoredUpdate } from '@/interfaces/sponsored'

export class SponsoredService {
    static async getSponsoredAutocomplete(search: string = ''): Promise<AutocompleteOption[]> {
        const endpoint = API_ROUTES.SPONSORED.GET_AUTOCOMPLETE_LIST
        const params = new URLSearchParams({ search })
        const response = await HttpService.get<ApiResponse<AutocompleteOption[]>>(`${endpoint}?${params}`)
        return response?.data || []
    }

    static async update(id: string, data: ISponsoredUpdate): Promise<ISponsored> {
        const endpoint = API_ROUTES.SPONSORED.UPDATE.replace('{id}', id)
        const response = await HttpService.put<ApiResponse<ISponsored>>(endpoint, data)
        return response?.data || {}
    }
}