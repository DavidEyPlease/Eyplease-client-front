import { EypleaseFile } from "./files"

export enum ToolSectionTypes {
    STAY_INFORMED = 'stay_informed',
    LEARN = 'learn',
    EXPLAIN = 'explain',
    PRODUCTS = 'products',
    PROPOSALS = 'proposals',
    GET_STARTED = 'get_started',
}

export interface ITool {
    id: string
    title: string
    description: string | null
    section: ToolSectionTypes
    created_at: Date
    slug: string
    files: EypleaseFile[]
}

export interface IToolsFilters {
    section: ToolSectionTypes
    search?: string
}