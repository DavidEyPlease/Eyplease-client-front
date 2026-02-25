import { IAuthUser } from "./auth"
import { PermissionKeys } from "./permissions"
import { IPlan } from "./plans"
import { ITaskCategory } from "./requestService"

export enum Gender {
    MALE = 'male',
    FEMALE = 'female'
}

export enum NewsletterTypes {
    NATIONAL = 'national_newsletter',
    UNITY = 'unit_newsletter',
}

export enum NewsletterSectionKeys {
    // Unity
    MONTHLY_PERSONAL_SALES = 'monthly_personal_sales',
    BIRTHDAYS = 'birthdays',
    ANNIVERSARIES = 'anniversaries',
    INITIATORS = 'initiators',
    GROUP_PRODUCTION = 'group_production',
    PINK_CIRCLES = 'pink_circle',
    HONOR_ROLL = 'honor_roll',
    INITIATION_CUT = 'initiation_cut',
    ROAD_TO_SUCCESS = 'road_to_success',
    STARS = 'stars',
    NEW_BEGGININGS = 'new_beginnings',
    POINTS_CLUB = 'points_club',

    // National
    NEW_DIRECTORS = 'new_directors',
    TARGET_UNIT_CLUB = 'target_unit_club',
    DIQ = 'diq',
    TSR = 'tsr',
    SALES_CUT = 'sales_cut',
    NATIONAL_INITIATION_CUT = 'national_initiation_cut',
    AREA_RECOGNITION = 'area_recognition',
    BONDS = 'bonds',
    NATIONAL_STARS = 'national_stars',
    NATIONAL_RANKING = 'national_ranking',
    TOWARDS_SUMMIT = 'towards_summit',
    TOPS = 'tops',
    NATIONAL_BIRTHDAYS = 'national_birthdays',
}

export enum MenuKeys {
    HOME = 'home',
    NEWSLETTER = 'newsletter',
    MY_CLIENTS = 'my-clients',
    GALLERY = 'gallery',
    PROFILE = 'profile',
    TOOLS = 'tools',
    TRAININGS = 'trainings',
    UPLOAD_REPORTS = 'upload-reports',
    POSTS = 'posts',
    SERVICES = 'services',
    EVENTS = 'events',
    CUSTOM_SERVICES = 'custom-services',
}

export enum CodeVerificationMethods {
    EMAIL = 'email',
    PHONE = 'phone',
}

export type StorageDisks = 'public' | 'private'

export type HttpMethods = 'POST' | 'PATCH' | 'PUT' | 'DELETE' | 'GET'

export interface IBaseDBProperties {
    id: string
    created_at: Date
    updated_at: Date
}

export type PaginationResponse<T> = {
    items: T[]
    total_items: number
    per_page: number
    last_page: number
    current_page: number
}

export type QueryParams<T> = {
    search?: string
    filters?: Partial<T>
    page?: number
    per_page?: number
    order_by?: string
    sort?: string
}

export interface JSONObject {
    [x: string]: JSONValue
}

export type JSONValue =
    | string
    | number
    | boolean
    | JSONObject
    | JSONArray

export type JSONArray = Array<JSONValue>

export type IGenericFilter = Record<string, JSONValue>

export type ApiResponse<T> = {
    data: T
    error?: string | null
    success: boolean
    message?: string
}

export type CursorPaginationResponse<T> = {
    items: T[]
    per_page: number
    last_page: boolean
    pagination_token: string | null
    previous_pagination_token: string | null
}

export interface AuthResponse {
    user: IAuthUser
    token: string
}

export interface FileUrls {
    url: string
    uri: string
}

export interface FAQ {
    id: string
    question: string
    answer: string
}

export type UnityBackgrounds = {
    type: NewsletterTypes.UNITY
    bg_sections: {
        target_pink_circle: string
        pink_circle: string
        pink_circle_vip: string
        pink_circle_vip_gold: string
        honor_roll: string
        birthdays: string
        road_success_diq: string
        diamond_star: string
        emerald_star: string
        pearl_star: string
        ruby_star: string
        sapphire_star: string
        road_success_future_director: string
        initiators: string
        diamond_luminaire: string
        emerald_luminaire: string
        pearl_luminaire: string
        ruby_luminaire: string
        sapphire_luminaire: string
        new_beginnings: string
        ranking: string
        ranking_top10: string
        road_success_target_a_diq: string
        road_success_target_a_fd: string
        club300: string
        club600: string
        club900: string
        club1200: string
        club1500: string
        club2000: string
        club2500: string
        club3000: string
        honor_roll2: string
        honor_roll3: string
    }
    covers: {
        start_page: string
        end_page: string
        cover_main: string
        honor_roll: string
        initiators: string
        new_beginnings: string
        birthdays: string
        stars: string
        luminaires: string
        pink_circle: string
        road_to_success: string
        club_pts: string
    }
}

export type PptxTowardsSummitBackground = {
    dir_executive: string
    dir_executive_elite: string
    dir_senior: string
    dir_senior_elite: string
}

export type PptxBondsBackground = {
    bonus_24: string
    bonus_12: string
    bonus_7: string
    bonus_5: string
    bonus_4: string
    bonus_3: string
    bonus_2: string
}

export type PptxStarsBackgrounds = {
    diamond_stars: string
    emerald_stars: string
    pearl_stars: string
    ruby_stars: string
    sapphire_stars: string
}

export type PptxTsrBackgrounds = {
    tsr_1: string
    tsr_2: string
    tsr_target1: string
    tsr_target2: string
}

export type PptxCutsBackgrounds = {
    cut_1100: string
    cut_750: string
    cut_600: string
    cut_450: string
    initiation_cut: string
    sales_cut: string
}

export type PptxTopsBackgrounds = {
    top1_double: string
    top1_single: string
    top2_double: string
    top2_single: string
    top3_double: string
    top3_single: string
    top_3: string
    top_personal_ini: string
    top_unit_initiation: string
    top_group_production: string
    top_production_unit: string
    top_unit_size: string
    top_personal_sales: string
}

export type PptxTopsCovers = {
    top_personal_ini: string
    top_unit_initiation: string
    top_group_production: string
    top_production_unit: string
    top_unit_size: string
    top_personal_sales: string
}

export type NationalBackgrounds = {
    type: NewsletterTypes.NATIONAL
    covers: PptxTopsCovers & {
        start_page: string
        end_page: string
        cover_main: string
        bonuses: string
        road_to_success: string
        cuts: string
        birthdays: string
        stars: string
        to_the_summit: string
        ranking: string
        tsr: string
    },
    bg_sections: PptxTowardsSummitBackground &
    PptxBondsBackground &
    PptxStarsBackgrounds &
    PptxTsrBackgrounds &
    PptxCutsBackgrounds &
    PptxTopsBackgrounds & {
        birthdays: string
        diq: string
        new_director: string
        top10: string
    }
}

export type ReportBackgrounds = UnityBackgrounds | NationalBackgrounds

export interface Template {
    id: string
    name: string
    picture: FileUrls
    unity_background_horizontal: UnityBackgrounds
    unity_background_vertical: UnityBackgrounds
    national_background_horizontal: UnityBackgrounds
    national_background_vertical: UnityBackgrounds
}

export interface NewsletterSection {
    id: string
    name: string
    canImported: boolean
    showInNewsletter: boolean
    sectionKey: NewsletterSectionKeys
}

export interface Newsletter {
    id: string
    name: string
    importDisplayName: string
    code: NewsletterTypes
    sections: NewsletterSection[]
}

export interface GlobalUtilData {
    templates: Template[]
    newsletters: Newsletter[]
    faqs: FAQ[]
    plans: IPlan[]
    task_categories: ITaskCategory[]
    training_categories: Array<{
        id: string
        name: string
        slug: string
    }>
}

interface MenuSubItem {
    label: string
    key: MenuKeys
    path: string,
    requiredPermission?: boolean
    permissionKeys?: PermissionKeys[]
}

export interface MenuItem {
    label: string
    key: MenuKeys
    path: string
    icon: string
    requiredPermission?: boolean
    permissionKeys?: PermissionKeys[]
    children?: MenuSubItem[]
}

export interface VerificationCodeRequestBody {
    token: string
    recipient?: string
    verificationMethod: string
    verificationAction: string
    code: string
}

export interface TableColumn {
    key: string
    label: string
}

export interface SvgProps {
    className?: string
    size?: number
}

export interface AutocompleteOption {
    value: string
    label: string
}