import { IPermission } from "./permissions"

export interface IPlan {
    id: string
    name: string
    /** free, standard, basic, executive, elite, national… */
    plan_key?: string
    /** unit (Directora) o clients (consultora) */
    audience?: string | null
    price: number
    features: string[]
    accesses: IPermission[]
    best_sell?: boolean
    /** Días de prueba gratis al registrarse (0: se contrata pagando) */
    trial_days?: number | null
    /** La oferta de entrada al registrarse, en lugar de la prueba (el Standard desde su lanzamiento: 3 meses a $99) */
    offer?: IPlanOffer | null
}

export interface IPlanOffer {
    months: number
    amount: number
}

export enum PlanKeys {
    FREE = 'free',
    STANDARD = 'standard',
    BASIC = 'basic',
    EXECUTIVE = 'executive',
    ELITE = 'elite',
    NATIONAL = 'national'
}