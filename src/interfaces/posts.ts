import { EypleaseFile } from "./files"

export enum PostSectionTypes {
    CUSTOMER_BIRTHDAYS = 'customer_birthdays',
    STARS = 'stars',
    NATIONAL_STARS = 'national_stars',
    BIRTHDAYS = 'birthdays',
    NATIONAL_BIRTHDAYS = 'national_birthdays',
    PINK_CIRCLE = 'pink_circle',
    NEW_BEGINNINGS = 'new_beginnings',
    ROAD_TO_SUCCESS = 'road_to_success',
    DIQ = 'diq',
    SALES_CUT = 'sales_cut',
    INITIATION_CUT = 'initiation_cut',
    HONOR_ROLL = 'honor_roll',
    ANNIVERSARIES = 'anniversaries',
    NATIONAL_ANNIVERSARIES = 'national_anniversaries',
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
    post_type: MainPostSectionTypes
    section: PostSectionTypes
    search?: string
}