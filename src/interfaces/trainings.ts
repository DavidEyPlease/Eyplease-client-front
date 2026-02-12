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
}

export interface ITrainingListFilters { category: string, search?: string }

export type FilterType = TrainingFilterTypes | TrainingCategoryTypes