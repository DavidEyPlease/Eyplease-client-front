import HttpService from '@/services/http'
import { API_ROUTES } from '@/constants/api'
import { ApiResponse } from '@/interfaces/common'
import { CustomerOfClient, ICustomerOfClientUpdate } from '@/interfaces/customerOfClients'

export class CustomerByClientService {
    static async update(id: string, data: ICustomerOfClientUpdate): Promise<CustomerOfClient> {
        const endpoint = API_ROUTES.MY_CLIENTS.UPDATE.replace('{id}', id)
        const response = await HttpService.put<ApiResponse<CustomerOfClient>>(endpoint, data)
        return response?.data || {}
    }
}