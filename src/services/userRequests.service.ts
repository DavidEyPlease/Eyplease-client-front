import HttpService from '@/services/http'
import { API_ROUTES } from '@/constants/api'
import { ApiResponse } from '@/interfaces/common'

export class UserRequestsService {
    static async sendCorrectionRequest(message: string): Promise<boolean> {
        const endpoint = API_ROUTES.CUSTOM_SERVICES.REQUEST_CORRECTION
        const response = await HttpService.post<ApiResponse<any>>(endpoint, { message })
        return response?.success
    }
}