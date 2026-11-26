import { FileUrls, Gender, IBaseDBProperties } from "./common"

export type VendorFilterType = 'unity' | 'directors'

export type GalleryFilters = {
    vendorRole: VendorFilterType
    letter: string
}

export interface ISponsored extends IBaseDBProperties {
    name: string;
    /** El apodo que le puso su Directora: sólo para su seguimiento (sus piezas y el boletín van con su nombre completo) */
    nickname?: string | null;
    account: string;
    country: string;
    gender: Gender | null;
    photo: FileUrls
    rank: string
    display_in_reports: boolean;
}

export interface ISponsoredUpdate {
    name?: string;
    /** Vacío o null lo quita (hasta 40 letras) */
    nickname?: string | null;
    gender?: Gender | null;
    photo?: string | null; // file ID
}