import { IPermission } from "./permissions"

export interface IPlan {
    id: string
    name: string
    /** free, standard, basic, executive, elite, national… */
    plan_key?: string
    price: number
    features: string[]
    accesses: IPermission[]
    best_sell?: boolean
}

export enum PlanKeys {
    FREE = 'free',
    STANDARD = 'standard',
    BASIC = 'basic',
    EXECUTIVE = 'executive',
    ELITE = 'elite',
    NATIONAL = 'national'
}