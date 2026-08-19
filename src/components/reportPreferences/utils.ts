import {
    IReportNewsletterPreferences,
    IReportPreferenceEntry,
    IReportPreferencesCatalog,
    IReportSectionPreference,
} from '@/interfaces/reportPreferences'
import { queryKeys } from '@/utils/cache'

export const REPORT_PREFERENCES_ENTITY = 'report-preferences'
export const reportPreferencesKey = queryKeys.list(REPORT_PREFERENCES_ENTITY)

/**
 * El borrador se guarda como un conjunto de claves ocultas, igual que la tabla del
 * backend: "code|section" para la sección completa y "code|section|sub" para un bloque.
 * Así el estado del panel es exactamente lo que se va a persistir, sin traducciones.
 */
export const sectionId = (code: string, sectionKey: string) => `${code}|${sectionKey}`
export const subSectionId = (code: string, sectionKey: string, sub: string) => `${code}|${sectionKey}|${sub}`

/**
 * Misma regla derivada que aplica el backend: una sección está oculta si tiene su
 * propia marca o si TODOS sus bloques lo están. Se replica aquí para que el panel
 * nunca pinte un estado que el servidor resolvería de otra forma.
 */
export const isSectionHidden = (hidden: Set<string>, code: string, section: IReportSectionPreference) => {
    if (hidden.has(sectionId(code, section.section_key))) return true
    if (!section.sub_sections.length) return false

    return section.sub_sections.every(sub => hidden.has(subSectionId(code, section.section_key, sub.key)))
}

/** Estado inicial del borrador a partir de lo que devuelve la API. */
export const draftFromCatalog = (catalog?: IReportPreferencesCatalog): Set<string> => {
    const hidden = new Set<string>()

    catalog?.newsletters.forEach(newsletter => {
        newsletter.sections.forEach(section => {
            if (section.is_hidden) hidden.add(sectionId(newsletter.code, section.section_key))

            section.sub_sections.forEach(sub => {
                if (sub.is_hidden) hidden.add(subSectionId(newsletter.code, section.section_key, sub.key))
            })
        })
    })

    return hidden
}

/**
 * Alterna una sección completa. Al volver a mostrarla se reactivan sus bloques: dejarla
 * visible con todo apagado sería un estado imposible (el backend la volvería a ocultar).
 */
export const toggleSection = (hidden: Set<string>, code: string, section: IReportSectionPreference): Set<string> => {
    const next = new Set(hidden)
    const key = sectionId(code, section.section_key)
    const wasHidden = isSectionHidden(hidden, code, section)

    if (wasHidden) {
        next.delete(key)
        section.sub_sections.forEach(sub => next.delete(subSectionId(code, section.section_key, sub.key)))
        return next
    }

    next.add(key)
    return next
}

/**
 * Alterna un bloque. Al reactivar uno se quita la marca de la sección, que pudo quedar
 * puesta al ocultarla entera.
 */
export const toggleSubSection = (
    hidden: Set<string>,
    code: string,
    section: IReportSectionPreference,
    subKey: string,
): Set<string> => {
    const next = new Set(hidden)
    const key = subSectionId(code, section.section_key, subKey)

    if (next.has(key)) {
        next.delete(key)
        next.delete(sectionId(code, section.section_key))
        return next
    }

    next.add(key)
    return next
}

/**
 * Convierte el borrador en el payload del PUT. Solo viajan las marcas explícitas: las
 * secciones que quedan ocultas por tener todos sus bloques apagados las deriva el backend.
 */
export const draftToEntries = (hidden: Set<string>): IReportPreferenceEntry[] =>
    [...hidden].map(key => {
        const [newsletter_code, section_key, sub_section] = key.split('|')
        return { newsletter_code, section_key, sub_section: sub_section ?? null }
    })

/** Cuántas secciones y bloques oculta el usuario en un boletín (para el aviso del wizard). */
export const countHidden = (hidden: Set<string>, newsletter?: IReportNewsletterPreferences) => {
    if (!newsletter) return { sections: 0, blocks: 0 }

    let sections = 0
    let blocks = 0

    newsletter.sections.forEach(section => {
        if (isSectionHidden(hidden, newsletter.code, section)) {
            sections += 1
            return
        }
        blocks += section.sub_sections.filter(sub =>
            hidden.has(subSectionId(newsletter.code, section.section_key, sub.key))
        ).length
    })

    return { sections, blocks }
}

/** Resumen en texto del aviso: "2 secciones y 3 bloques". */
export const hiddenSummaryLabel = ({ sections, blocks }: { sections: number, blocks: number }) => {
    const parts: string[] = []
    if (sections) parts.push(`${sections} ${sections === 1 ? 'sección' : 'secciones'}`)
    if (blocks) parts.push(`${blocks} ${blocks === 1 ? 'bloque' : 'bloques'}`)

    return parts.join(' y ')
}
