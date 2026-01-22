import { FileUrls, Gender, IBaseDBProperties } from "./common"

export type VendorFilterType = 'unity' | 'directors'

export type GalleryFilters = {
    vendorRole: VendorFilterType
    letter: string
}

export interface ISponsored extends IBaseDBProperties {
    name: string;
    account: string;
    country: string;
    gender: Gender | null;
    photo: FileUrls
    rank: string
    display_in_reports: boolean;
}

export interface ISponsoredUpdate {
    name?: string;
    gender?: Gender | null;
    photo?: string | null; // file ID
}