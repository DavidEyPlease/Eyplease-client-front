import { Gender, IBaseDBProperties } from "./common"
import { EypleaseFile } from "./files"

export interface CustomerOfClient extends IBaseDBProperties {
    name: string;
    photo: EypleaseFile
    gender: Gender
    dob: Date | null;
}

export interface ICustomerOfClientUpdate {
    name?: string;
    photo?: string;
    gender?: Gender;
}

export interface ICustomersOfClientFilters {
    letter: string
    search?: string
}