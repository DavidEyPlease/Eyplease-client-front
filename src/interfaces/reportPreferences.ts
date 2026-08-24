import { NewsletterTypes } from './common'

/** Bloque dentro de una sección (una gema de estrellas, un club de puntos…). */
export interface IReportSubSection {
    key: string
    name: string
    is_hidden: boolean
}

/** Puesto con mínimo de puntos configurable (hoy solo los del cuadro de honor). */
export interface IReportSectionPosition {
    key: string
    name: string
    /** null = sin mínimo; manda la regla de negocio de siempre (top 3 por puntos). */
    min_points: number | null
}

export interface IReportSectionPreference {
    section_key: string
    name: string
    /** Ya viene derivado: oculta explícitamente o con todos sus bloques ocultos. */
    is_hidden: boolean
    /** Vacío = la sección no admite mínimos de puntos. */
    positions: IReportSectionPosition[]
    /** Vacío = la sección solo se puede ocultar entera. */
    sub_sections: IReportSubSection[]
}

export interface IReportNewsletterPreferences {
    code: NewsletterTypes
    name: string
    sections: IReportSectionPreference[]
}

/** Catálogo completo + estado del usuario: es la respuesta de GET /reports/preferences. */
export interface IReportPreferencesCatalog {
    newsletters: IReportNewsletterPreferences[]
}

/** Entrada oculta que viaja en el PUT; sub_section null = la sección completa. */
export interface IReportPreferenceEntry {
    newsletter_code: string
    section_key: string
    sub_section?: string | null
}

/** Mínimo por puesto que viaja en el PUT; min_points null borra el mínimo. */
export interface IReportThresholdEntry {
    newsletter_code: string
    section_key: string
    position: string
    min_points: number | null
}

export interface IReportPreferencesPayload {
    hidden: IReportPreferenceEntry[]
    thresholds: IReportThresholdEntry[]
}
