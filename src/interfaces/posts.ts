import { EypleaseFile } from "./files"

export enum PostSectionTypes {
    STARS = 'stars',
    BIRTHDAYS = 'birthdays',
    PINK_CIRCLE = 'pink_circle',
    NEW_BEGINNINGS = 'new_beginnings',
    ROAD_TO_SUCCESS = 'road_to_success',
    DIQ = 'diq',
    SALES_CUT = 'sales_cut',
    INITIATION_CUT = 'initiation_cut',
    HONOR_ROLL = 'honor_roll',
    ANNIVERSARIES = 'anniversaries',
}

export enum MainPostSectionTypes {
    CLIENTS = 'clients',
    DIRECTORS = 'directors',
    UNITY = 'unity',
}

export interface IPost {
    id: string
    title: string
    created_at: Date
    shared_at: Date | null
    user: {
        id: string
        name: string
        avatar: string
    }
    files: EypleaseFile[]
}

export interface IPostsFilters {
    mainSection: MainPostSectionTypes
    section: PostSectionTypes
    search?: string
}