import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NewsletterWizard } from '../useNewsletterWizard'

/** Paso 3 — secciones incluidas como chips; todas activas por defecto. */
const StepSections = ({ wizard }: { wizard: NewsletterWizard }) => {
    const total = wizard.availableSections.length
    const allSelected = total > 0 && wizard.sections.length === total

    return (
        <div>
            <h3 className="text-[16.5px] font-bold">Secciones a incluir</h3>
            <p className="mb-[18px] text-[13px] text-muted-foreground">Todas vienen activadas. Desmarca las que no quieras incluir.</p>

            <div className="mb-4 flex items-center justify-between">
                <span className="text-[13px] text-muted-foreground">
                    {wizard.sections.length} de {total} seleccionadas
                </span>
                <button type="button" onClick={wizard.toggleAllSections} className="text-[12.5px] font-semibold text-primary hover:underline">
                    {allSelected ? 'Deseleccionar todo' : 'Seleccionar todo'}
                </button>
            </div>

            <div className="flex flex-wrap gap-2.5">
                {wizard.availableSections.map(section => {
                    const selected = wizard.sections.includes(section.sectionKey)
                    return (
                        <button
                            key={section.sectionKey}
                            type="button"
                            onClick={() => wizard.toggleSection(section.sectionKey)}
                            className={cn(
                                'inline-flex items-center gap-2 rounded-full border-[1.5px] py-2 pl-3 pr-3.5 text-[12.5px] font-medium transition-all duration-150',
                                selected
                                    ? 'border-primary/35 bg-primary/10 text-primary'
                                    : 'border-[#e2e0ee] bg-card text-muted-foreground hover:border-[#d7d3ec]'
                            )}
                        >
                            <span
                                className={cn(
                                    'grid size-[15px] place-content-center rounded-[5px] border-[1.5px] transition-all duration-150',
                                    selected ? 'border-primary bg-primary text-white' : 'border-[#e2e0ee]'
                                )}
                            >
                                {selected && <Check className="size-2.5" strokeWidth={3} />}
                            </span>
                            {section.name}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

export default StepSections
