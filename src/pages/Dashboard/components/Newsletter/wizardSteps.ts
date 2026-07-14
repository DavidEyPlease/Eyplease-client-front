import { defineStepper } from '@stepperize/react'
import { Users, Globe, type LucideIcon } from 'lucide-react'
import { NewsletterTypes } from '@/interfaces/common'

/**
 * Definición del asistente por pasos del boletín mensual. Sólo describe el orden y
 * las etiquetas; el estado de la selección vive en useNewsletterWizard y la
 * navegación la resuelve stepperize.
 */
export const wizardStepper = defineStepper([
    { id: 'type', label: 'Tipo' },
    { id: 'template', label: 'Plantilla' },
    { id: 'sections', label: 'Secciones' },
    { id: 'format', label: 'Formato' },
])

export type WizardStepId = 'type' | 'template' | 'sections' | 'format'

export type ReportFileType = 'pdf' | 'pptx'

/** Icono + descripción por tipo de boletín (el nombre visible sale de utilData). */
export const NEWSLETTER_TYPE_META: Record<NewsletterTypes, { icon: LucideIcon; description: string }> = {
    [NewsletterTypes.UNITY]: {
        icon: Users,
        description: 'Reconocimiento de las consultoras de tu unidad.',
    },
    [NewsletterTypes.NATIONAL]: {
        icon: Globe,
        description: 'Cortes y reinas a nivel de área nacional.',
    },
}
