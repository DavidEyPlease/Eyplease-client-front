import { IAuthUser } from "@/interfaces/auth"
import { IUnityMonthlyReport } from "@/interfaces/monthlyReports"

class DataValidator {
    static hasData<T>(data: T[] | null | undefined): data is T[] {
        return Array.isArray(data) && data.length > 0
    }

    static hasSomeData<T>(data: Record<string, T[] | null | undefined>): boolean {
        if (!data) return false
        const values = Object.values(data)
        return values.some(arr => this.hasData(arr))
    }

    static validateHonorRollData(data: IUnityMonthlyReport['honor_roll']): boolean {
        if (!this.hasData(data)) return false
        return data.every(item =>
            item.sponsored_name &&
            item.photo_url &&
            typeof item.report_value === 'number'
        )
    }

    static validateInitiationCutData(data: IUnityMonthlyReport['initiation_cut']): boolean {
        return Boolean(data)
    }

    static validatePointsClubData(data: IUnityMonthlyReport['points_club']): boolean {
        if (!data) return false
        const values = Object.values(data)
        return values.some(clubArray => this.hasData(clubArray))
    }

    static validateRoadToSuccessData(data: IUnityMonthlyReport['road_to_success']): boolean {
        if (!data) return false
        const values = Object.values(data)
        return values.some(clubArray => this.hasData(clubArray))
    }

    static validateStarsData(data: IUnityMonthlyReport['stars']): boolean {
        if (!data) return false
        const values = Object.values(data)
        return values.some(clubArray => this.hasData(clubArray))
    }

    static validateGroupProductionData(data: IUnityMonthlyReport['group_production']): boolean {
        if (!data) return false
        const values = Object.values(data)
        return values.some(clubArray => this.hasData(clubArray))
    }

    static validatePinkCircleData(data: IUnityMonthlyReport['pink_circle']): boolean {
        if (!data) return false
        const values = Object.values(data)
        return values.some(clubArray => this.hasData(clubArray))
    }

    static validateAuthUser(user: IAuthUser): boolean {
        return !!(user.name && user.profile_picture?.url)
    }
}

export default DataValidator