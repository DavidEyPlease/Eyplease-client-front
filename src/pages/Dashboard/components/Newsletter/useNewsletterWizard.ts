import { useCallback, useEffect, useMemo, useState } from 'react'
import useAuthStore from '@/store/auth'
import { generatePdfReport, generatePptxReport } from '@/services/reports/reportGenerator'
import { Newsletter, NewsletterSection, NewsletterSectionKeys, NewsletterTypes, Template } from '@/interfaces/common'
import { ReportFileType, WizardStepId } from './wizardSteps'

export interface NewsletterWizard {
    /** Tipo de boletín (unidad/nacional); null hasta que el usuario elige. */
    type: NewsletterTypes | null
    templateId: string | null
    format: ReportFileType
    sections: NewsletterSectionKeys[]
    /** Plantilla resaltada en la vista en vivo al pasar el cursor (paso plantilla). */
    hoverTemplateId: string | null
    /** Plantilla abierta en la vista previa ampliada (lightbox), o null. */
    previewTemplateId: string | null

    // Datos ya derivados para pintar sin repetir lookups.
    newsletters: Newsletter[]
    templates: Template[]
    availableSections: NewsletterSection[]
    selectedNewsletterName: string
    selectedTemplate?: Template
    /** Plantilla a mostrar en la vista en vivo (hover > seleccionada). */
    livePreviewTemplate?: Template

    // Acciones.
    setType: (type: NewsletterTypes) => void
    setTemplateId: (id: string) => void
    setFormat: (format: ReportFileType) => void
    toggleSection: (key: NewsletterSectionKeys) => void
    toggleAllSections: () => void
    setHoverTemplateId: (id: string | null) => void
    setPreviewTemplateId: (id: string | null) => void

    // Derivados de estado.
    isStepValid: (step: WizardStepId) => boolean
    completedCount: number
    generate: () => void
}

/**
 * Estado y lógica del asistente del boletín mensual. Toma la data de utilData
 * (newsletters ya filtrados por permisos + plantillas) y dispara la generación en
 * segundo plano (el progreso/descarga los gestiona el centro de tareas), igual que
 * el flujo anterior.
 */
export const useNewsletterWizard = (): NewsletterWizard => {
    const { newsletters, templates } = useAuthStore(state => state.utilData)
    const user = useAuthStore(state => state.user)

    const sectionsOf = useCallback(
        (type: NewsletterTypes | null): NewsletterSection[] =>
            type ? newsletters.find(n => n.code === type)?.sections.filter(s => s.showInNewsletter) ?? [] : [],
        [newsletters]
    )

    const [type, setTypeState] = useState<NewsletterTypes | null>(null)
    const [templateId, setTemplateId] = useState<string | null>(user?.template_id ?? null)
    const [format, setFormat] = useState<ReportFileType>('pdf')
    const [sections, setSections] = useState<NewsletterSectionKeys[]>([])
    const [hoverTemplateId, setHoverTemplateId] = useState<string | null>(null)
    const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null)

    // Con un solo boletín permitido lo preseleccionamos (no tiene sentido elegir).
    useEffect(() => {
        if (!type && newsletters.length === 1) {
            const only = newsletters[0].code
            setTypeState(only)
            setSections(sectionsOf(only).map(s => s.sectionKey))
        }
    }, [newsletters, type, sectionsOf])

    // La plantilla por defecto es la guardada del usuario, en cuanto carga.
    useEffect(() => {
        if (!templateId && user?.template_id) setTemplateId(user.template_id)
    }, [user, templateId])

    // Elegir tipo reinicia las secciones a "todas incluidas" (comportamiento previo).
    const setType = useCallback(
        (next: NewsletterTypes) => {
            setTypeState(next)
            setSections(sectionsOf(next).map(s => s.sectionKey))
        },
        [sectionsOf]
    )

    const availableSections = useMemo(() => sectionsOf(type), [sectionsOf, type])

    const toggleSection = useCallback((key: NewsletterSectionKeys) => {
        setSections(prev => (prev.includes(key) ? prev.filter(s => s !== key) : [...prev, key]))
    }, [])

    const toggleAllSections = useCallback(() => {
        const all = availableSections.map(s => s.sectionKey)
        setSections(prev => (prev.length === all.length ? [] : all))
    }, [availableSections])

    const selectedTemplate = templates.find(t => t.id === templateId)
    const livePreviewTemplate = templates.find(t => t.id === (hoverTemplateId ?? templateId))
    const selectedNewsletterName = newsletters.find(n => n.code === type)?.name ?? '—'

    const isStepValid = useCallback(
        (step: WizardStepId) => {
            switch (step) {
                case 'type':
                    return !!type
                case 'template':
                    return !!templateId
                case 'sections':
                    return sections.length > 0
                case 'format':
                    return true
            }
        },
        [type, templateId, sections.length]
    )

    const completedCount = [!!type, !!templateId, !!type && sections.length > 0, true].filter(Boolean).length

    const generate = useCallback(() => {
        if (!type || !templateId) return
        const params = {
            templateId,
            reportType: type,
            sections,
            title: newsletters.find(n => n.code === type)?.name ?? 'Boletín',
        }
        if (format === 'pdf') generatePdfReport(params)
        else generatePptxReport(params)
    }, [type, templateId, sections, format, newsletters])

    return {
        type,
        templateId,
        format,
        sections,
        hoverTemplateId,
        previewTemplateId,
        newsletters,
        templates,
        availableSections,
        selectedNewsletterName,
        selectedTemplate,
        livePreviewTemplate,
        setType,
        setTemplateId,
        setFormat,
        toggleSection,
        toggleAllSections,
        setHoverTemplateId,
        setPreviewTemplateId,
        isStepValid,
        completedCount,
        generate,
    }
}
