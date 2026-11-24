import { IBaseDBProperties } from "./common"
import { EypleaseFile } from "./files"

export enum TrainingCategoryTypes {
    SALES = 'sales',
    MARKETING = 'marketing',
}

export enum TrainingFilterTypes {
    ALL = 'all',
    RECENT = 'recent'
}

export interface ITraining extends IBaseDBProperties {
    id: string
    title: string
    category: TrainingCategoryTypes
    files: EypleaseFile[]
    /** Presentación interactiva del tema (página web). Sin ella, el tema sólo trae archivos. */
    web_url?: string | null
    /** La Directora (Elite o Área) la puede compartir con su Unidad */
    unit_share?: boolean
}

/** La liga de una presentación para la Unidad, como la ve la Directora */
export interface UnitLink {
    url: string
    times_opened: number
    last_opened_at: string | null
    people: { name: string | null, times_opened: number, last_opened_at: string | null, registered: boolean }[]
    totals: { identified: number, registered: number }
}

/** Lo que ve la consultora al abrir la liga, sin cuenta */
export interface UnitLinkPublic {
    training: { id: string, title: string, web_url: string }
    director: { name: string, short_name: string, first_name: string, photo: string | null, logo: string | null }
    country: string
}

export interface UnitLinkOpen {
    consultant: { first_name: string, username: string } | null
    has_account: boolean
}

export interface ITrainingListFilters { category: string, search?: string }

export type FilterType = TrainingFilterTypes | TrainingCategoryTypes