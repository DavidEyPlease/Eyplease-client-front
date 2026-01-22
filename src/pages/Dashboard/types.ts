import { UserRequestStatusTypes } from "@/interfaces/requestService"
import { ToolSectionTypes } from "@/interfaces/tools"

export type PostsSummaryType = Array<{ section: string, total: number }>
export type ToolsSummaryType = Array<{ section: ToolSectionTypes, total: number }>
export type CustomServicesSummaryTypes = Array<{ status: UserRequestStatusTypes, total: number }>

export type DashboardSummary = {
    posts: PostsSummaryType,
    tools: ToolsSummaryType,
    custom_services: CustomServicesSummaryTypes
}