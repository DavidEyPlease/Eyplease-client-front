import { useState } from 'react'
import { Check, EyeOffIcon, SlidersHorizontalIcon } from 'lucide-react'

import ContentPreferencesSheet from '@/components/reportPreferences/ContentPreferencesSheet'
import { hiddenSummaryLabel } from '@/components/reportPreferences/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { NewsletterWizard } from '../useNewsletterWizard'

const CHIP_CLASSES = 'inline-flex items-center gap-2 rounded-full border-[1.5px] py-2 pl-3 pr-3.5 text-[12.5px] font-medium transition-all duration-150'
const CHECKBOX_CLASSES = 'grid size-[15px] place-content-center rounded-[5px] border-[1.5px] transition-all duration-150'

/** Paso 3 — secciones incluidas en ESTA generación; la configuración fija vive en el sheet. */
const StepSections = ({ wizard }: { wizard: NewsletterWizard }) => {
    const [sheetOpen, setSheetOpen] = useState(false)

    const selectable = wizard.availableSections.filter(section => !wizard.hiddenSectionKeys.has(section.sectionKey))
    const allSelected = selectable.length > 0 && wizard.sections.length === selectable.length
    const summary = hiddenSummaryLabel(wizard.hiddenSummary)

    return (
        <div>
            <div className="mb-[18px] flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h3 className="text-[16.5px] font-bold">Secciones a incluir</h3>
                    <p className="text-[13px] text-muted-foreground">Solo para este boletín. Desmarca las que no quieras.</p>
                </div>
                <button
                    type="button"
                    onClick={() => setSheetOpen(true)}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-xl border px-3.5 py-2 text-[12.5px] font-semibold text-primary transition-colors hover:bg-primary/5"
                >
                    <SlidersHorizontalIcon className="size-3.5" />
                    Personalizar contenido
                </button>
            </div>

            <div className="mb-4 flex items-center justify-between">
                <span className="text-[13px] text-muted-foreground">
                    {wizard.sections.length} de {selectable.length} seleccionadas
                </span>
                <button type="button" onClick={wizard.toggleAllSections} className="text-[12.5px] font-semibold text-primary hover:underline">
                    {allSelected ? 'Deseleccionar todo' : 'Seleccionar todo'}
                </button>
            </div>

            <div className="flex flex-wrap gap-2.5">
                {wizard.availableSections.map(section => {
                    const hiddenByPreference = wizard.hiddenSectionKeys.has(section.sectionKey)
                    const selected = !hiddenByPreference && wizard.sections.includes(section.sectionKey)

                    /* Oculta por configuración: se muestra para explicar por qué falta,
                       pero no se puede marcar desde aquí — se cambia en el sheet. */
                    if (hiddenByPreference) {
                        return (
                            <Tooltip key={section.sectionKey}>
                                <TooltipTrigger asChild>
                                    <button
                                        type="button"
                                        onClick={() => setSheetOpen(true)}
                                        className={cn(CHIP_CLASSES, 'cursor-pointer border-dashed border-[#e2e0ee] bg-surface-soft text-muted-foreground')}
                                    >
                                        <EyeOffIcon className="size-3.5 shrink-0" />
                                        {section.name}
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>Oculta por tu configuración. Toca para cambiarla.</TooltipContent>
                            </Tooltip>
                        )
                    }

                    return (
                        <button
                            key={section.sectionKey}
                            type="button"
                            onClick={() => wizard.toggleSection(section.sectionKey)}
                            className={cn(
                                CHIP_CLASSES,
                                'cursor-pointer',
                                selected
                                    ? 'border-primary/35 bg-primary/10 text-primary'
                                    : 'border-[#e2e0ee] bg-card text-muted-foreground hover:border-[#d7d3ec]'
                            )}
                        >
                            <span className={cn(CHECKBOX_CLASSES, selected ? 'border-primary bg-primary text-white' : 'border-[#e2e0ee]')}>
                                {selected && <Check className="size-2.5" strokeWidth={3} />}
                            </span>
                            {section.name}
                        </button>
                    )
                })}
            </div>

            {summary && (
                <p className="mt-4 flex flex-wrap items-center gap-x-1.5 gap-y-1 rounded-xl border border-primary/20 bg-primary/5 px-3.5 py-2.5 text-[12.5px] font-semibold text-primary">
                    <EyeOffIcon className="size-3.5" />
                    Tu configuración oculta {summary}.
                    <button type="button" onClick={() => setSheetOpen(true)} className="cursor-pointer underline">
                        Editar
                    </button>
                </p>
            )}

            <ContentPreferencesSheet
                open={sheetOpen}
                preferences={wizard.preferences}
                newsletterCode={wizard.type}
                onOpenChange={setSheetOpen}
            />
        </div>
    )
}

export default StepSections
