import { useState } from 'react'
import { ChevronDownIcon } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { IReportSectionPreference } from '@/interfaces/reportPreferences'
import { cn } from '@/lib/utils'
import { isSectionHidden, positionId, subSectionId, ThresholdDraft } from './utils'

interface Props {
    code: string
    section: IReportSectionPreference
    hidden: Set<string>
    thresholds: ThresholdDraft
    onToggleSection: () => void
    onToggleSubSection: (subKey: string) => void
    onChangeThreshold: (position: string, minPoints: number | null) => void
}

const SUB_ITEM_CLASSES = 'flex items-center justify-between gap-3 rounded-xl border bg-surface-soft px-3 py-2 text-[12.5px] font-medium'

/** Sección del boletín: interruptor propio y, si los tiene, sus bloques desplegables. */
const SectionRow = ({ code, section, hidden, thresholds, onToggleSection, onToggleSubSection, onChangeThreshold }: Props) => {
    const [open, setOpen] = useState(false)

    const sectionHidden = isSectionHidden(hidden, code, section)
    const subSections = section.sub_sections
    const positions = section.positions
    const visibleSubs = subSections.filter(sub => !hidden.has(subSectionId(code, section.section_key, sub.key))).length
    const withMinimum = positions.filter(position => thresholds[positionId(code, section.section_key, position.key)] !== undefined).length
    const expandable = subSections.length > 0 || positions.length > 0

    /** Vacío borra el mínimo; el resto se acota a enteros no negativos. */
    const onMinPointsChange = (position: string, value: string) => {
        if (value.trim() === '') return onChangeThreshold(position, null)

        const parsed = Number(value)
        if (!Number.isFinite(parsed) || parsed < 0) return

        onChangeThreshold(position, Math.floor(parsed))
    }

    return (
        <div className="border-b border-border/60 last:border-b-0">
            <div className="flex items-center gap-3 px-4 py-3">
                <Switch
                    checked={!sectionHidden}
                    aria-label={`Mostrar ${section.name}`}
                    onCheckedChange={onToggleSection}
                />

                <div className="min-w-0 flex-1">
                    <p className={cn('truncate text-[13px] font-bold tracking-tight', sectionHidden && 'text-muted-foreground')}>
                        {section.name}
                    </p>
                    <p className="text-[11px] font-medium text-muted-foreground">
                        {sectionHidden
                            ? 'Oculta en tus boletines'
                            : subSections.length
                                ? `${visibleSubs} de ${subSections.length} bloques visibles`
                                : positions.length
                                    ? withMinimum
                                        ? `${withMinimum} de ${positions.length} puestos con mínimo`
                                        : 'Sin mínimo de puntos'
                                    : 'Sin bloques configurables'}
                    </p>
                </div>

                {expandable && (
                    <button
                        type="button"
                        aria-expanded={open}
                        aria-label={open ? `Ocultar bloques de ${section.name}` : `Ver bloques de ${section.name}`}
                        onClick={() => setOpen(current => !current)}
                        className="grid size-8 shrink-0 cursor-pointer place-content-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-soft hover:text-foreground"
                    >
                        <ChevronDownIcon className={cn('size-4 transition-transform duration-150', open && 'rotate-180')} />
                    </button>
                )}
            </div>

            {open && positions.length > 0 && (
                <div className={cn('px-4 pb-4 pl-14', sectionHidden && 'pointer-events-none opacity-45')}>
                    <p className="mb-2 text-[11px] font-semibold text-muted-foreground">
                        Mínimo de puntos por puesto · déjalo vacío para no exigir mínimo
                    </p>
                    <div className="grid gap-2 sm:grid-cols-3">
                        {positions.map(position => {
                            const value = thresholds[positionId(code, section.section_key, position.key)]

                            return (
                                <label key={position.key} className="flex flex-col gap-1">
                                    <span className="text-[11.5px] font-semibold">{position.name}</span>
                                    <Input
                                        type="number"
                                        min={0}
                                        inputMode="numeric"
                                        placeholder="Sin mínimo"
                                        className="h-9 text-[13px]"
                                        value={value ?? ''}
                                        onChange={event => onMinPointsChange(position.key, event.target.value)}
                                    />
                                </label>
                            )
                        })}
                    </div>
                </div>
            )}

            {open && subSections.length > 0 && (
                <div
                    className={cn(
                        'grid gap-2 px-4 pb-4 pl-14 sm:grid-cols-2',
                        /* Con la sección oculta sus bloques no pintan nada: se atenúan */
                        sectionHidden && 'pointer-events-none opacity-45',
                    )}
                >
                    {subSections.map(sub => {
                        const subHidden = hidden.has(subSectionId(code, section.section_key, sub.key))

                        return (
                            <label key={sub.key} className={cn(SUB_ITEM_CLASSES, subHidden && 'text-muted-foreground line-through')}>
                                <span className="min-w-0 truncate">{sub.name}</span>
                                <Switch
                                    checked={!subHidden}
                                    aria-label={`Mostrar ${sub.name}`}
                                    onCheckedChange={() => onToggleSubSection(sub.key)}
                                />
                            </label>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default SectionRow
