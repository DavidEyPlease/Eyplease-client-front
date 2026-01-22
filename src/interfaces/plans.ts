import { IPermission } from "./permissions"

export interface IPlan {
    id: string
    name: string
    price: number
    features: string[]
    accesses: IPermission[]
    best_sell?: boolean
}