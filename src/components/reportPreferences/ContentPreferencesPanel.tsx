import { Skeleton } from '@/components/ui/skeleton'
import { EmptySection } from '@/components/generics/EmptySection'
import { cn } from '@/lib/utils'
import SectionRow from './SectionRow'
import { useReportPreferences } from './useReportPreferences'

interface Props {
    /** Estado y acciones compartidos: los provee quien monta el panel (sheet o perfil). */
    preferences: ReturnType<typeof useReportPreferences>
    /** Acota la lista a un boletín. Sin él se muestran todos (perfil). */
    newsletterCode?: string | null
    className?: string
}

/**
 * Lista de boletines con sus secciones y bloques. No trae cabecera ni botones a
 * propósito: los pone quien lo monta (el sheet del asistente o la ficha del perfil),
 * que son quienes deciden dónde va el guardado.
 */
const ContentPreferencesPanel = ({ preferences, newsletterCode, className }: Props) => {
    const { catalog, loading, draft, thresholds, onToggleSection, onToggleSubSection, onChangeThreshold } = preferences

    const newsletters = (catalog?.newsletters ?? []).filter(
        item => !newsletterCode || item.code === newsletterCode
    )
    /* Con un solo boletín el encabezado no aporta: ya lo dice el contexto */
    const showHeadings = newsletters.length > 1

    if (loading) {
        return (
            <div className={cn('flex flex-col gap-3 p-4', className)}>
                {Array.from({ length: 6 }, (_, index) => <Skeleton key={index} className="h-14 rounded-xl" />)}
            </div>
        )
    }

    if (!newsletters.length) {
        return (
            <EmptySection
                title="Sin secciones configurables"
                description="Tu plan todavía no incluye boletines con secciones que puedas personalizar."
            />
        )
    }

    return (
        <div className={cn('flex flex-col', className)}>
            {newsletters.map(newsletter => (
                <section key={newsletter.code}>
                    {showHeadings && (
                        <h4 className="sticky top-0 z-10 border-b bg-surface-soft px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            {newsletter.name}
                        </h4>
                    )}

                    {newsletter.sections.map(section => (
                        <SectionRow
                            key={section.section_key}
                            code={newsletter.code}
                            section={section}
                            hidden={draft}
                            thresholds={thresholds}
                            onToggleSection={() => onToggleSection(newsletter.code, section)}
                            onToggleSubSection={subKey => onToggleSubSection(newsletter.code, section, subKey)}
                            onChangeThreshold={(position, minPoints) =>
                                onChangeThreshold(newsletter.code, section.section_key, position, minPoints)}
                        />
                    ))}
                </section>
            ))}
        </div>
    )
}

export default ContentPreferencesPanel
