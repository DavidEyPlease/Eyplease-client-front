import { NewsletterSection } from "./common"
import { ArtifactType, EypleaseFile } from "./files"

export type PostArtifactType = ArtifactType

export enum PostTypes {
    NEWSLETTER = 'newsletter',
    MY_CLIENTS = 'my_clients',
    EYPLEASE_CLIENTS = 'eyplease_clients',
}

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

/** Persona del diseño: lo mínimo para poder subirle la foto desde la publicación. */
export interface IPostVendorable {
    id: string
    name: string
    type: 'sponsored' | 'customer'
}

export interface IPost {
    id: string
    title: string
    created_at: Date
    shared_at: Date | null
    is_regenerating: boolean
    type: PostTypes
    newsletter_section: NewsletterSection | null
    metadata: string | null
    /**
     * Si la persona no tiene foto propia, el diseño sale con el avatar por defecto:
     * volver a generarlo sin subirla antes daría exactamente la misma pieza.
     */
    has_photo?: boolean
    vendorable?: IPostVendorable | null
    files: EypleaseFile[]
    /**
     * El mes al que pertenecen los DATOS, que no es el día en que se hizo la
     * pieza: la del cierre de agosto se genera en septiembre.
     */
    newsletter_date?: string | null
    /** Cuando pasó lo que la pieza celebra. Null = pieza del lote del mes. */
    live_event_at?: string | null
    /**
     * Versiones de una MISMA noticia. Círculo Rosa saca dos piezas por consultora
     * —con y sin el producto— para que la Directora elija cuál usar; las dos
     * comparten `version_group`. Null en casi todas las secciones, que sólo
     * tienen una.
     */
    version_key?: string | null
    version_label?: string | null
    version_group?: string | null
}

export interface IPostsFilters {
    post_type: MainPostSectionTypes
    section: PostSectionTypes
    search?: string
}