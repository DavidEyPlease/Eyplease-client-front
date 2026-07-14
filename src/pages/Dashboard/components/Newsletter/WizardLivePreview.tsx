import { Check, Eye, FileText, List, Users, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NewsletterWizard } from './useNewsletterWizard'

/** Ancho de la barra por nº de pasos completados (0–4); discreto, sin estilos en línea. */
const PROGRESS_WIDTH = ['w-0', 'w-1/4', 'w-1/2', 'w-3/4', 'w-full']

interface Props {
    wizard: NewsletterWizard
    stepNumber: number
    totalSteps: number
}

/** Vista en vivo: refleja en tiempo real la portada elegida y lo que se lleva armado. */
const WizardLivePreview = ({ wizard, stepNumber, totalSteps }: Props) => {
    const cover = wizard.livePreviewTemplate
    const total = wizard.availableSections.length

    const rows: { set: boolean; icon: LucideIcon; label: string; value: string }[] = [
        { set: !!wizard.type, icon: Users, label: 'Tipo', value: wizard.type ? wizard.selectedNewsletterName : '—' },
        { set: !!wizard.templateId, icon: Eye, label: 'Plantilla', value: wizard.selectedTemplate?.name ?? '—' },
        { set: !!wizard.type, icon: List, label: 'Secciones', value: wizard.type ? `${wizard.sections.length} de ${total}` : '—' },
        { set: true, icon: FileText, label: 'Formato', value: wizard.format === 'pdf' ? 'PDF' : 'PowerPoint' },
    ]

    return (
        <aside className="bg-linear-to-b from-[#faf9fe] to-card p-6">
            <div className="mb-3.5 flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-[11.5px] font-bold uppercase tracking-wide text-primary">
                    <i className="size-2 rounded-full bg-[#22c55e] shadow-[0_0_0_4px_rgba(34,197,94,0.18)] animate-pulse" />
                    Vista en vivo
                </span>
                <span className="text-xs font-semibold text-muted-foreground">
                    Paso {stepNumber} de {totalSteps}
                </span>
            </div>

            <div className="mb-4 grid h-52 place-content-center overflow-hidden rounded-[14px] border border-[#ecebf3] shadow-sm">
                {cover ? (
                    <img src={cover.picture.url} alt={cover.name} className="h-52 w-full object-cover" />
                ) : (
                    <span className="text-[12.5px] text-muted-foreground">Elige una plantilla</span>
                )}
            </div>

            <div className="mb-4 flex flex-col">
                {rows.map(row => {
                    const Icon = row.icon
                    return (
                        <div key={row.label} className="flex items-center gap-3 border-b border-dashed border-[#ecebf3] py-3 last:border-b-0">
                            <span
                                className={cn(
                                    'grid size-7 shrink-0 place-content-center rounded-[9px] transition-all duration-200',
                                    row.set ? 'bg-primary/10 text-primary' : 'bg-[#f1eff8] text-muted-foreground'
                                )}
                            >
                                <Icon className="size-4" />
                            </span>
                            <span className="min-w-0">
                                <span className="block text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">{row.label}</span>
                                <span className={cn('block truncate text-[13.5px] font-semibold', row.set ? 'text-foreground' : 'text-muted-foreground')}>
                                    {row.value}
                                </span>
                            </span>
                            <Check className={cn('ml-auto size-4 shrink-0 text-[#16a34a] transition-opacity duration-200', row.set ? 'opacity-100' : 'opacity-0')} />
                        </div>
                    )
                })}
            </div>

            <div className="h-1.5 overflow-hidden rounded-full bg-[#eceaf6]">
                <div className={cn('h-full rounded-full bg-gradient-to-r from-[#6B4FE3] to-[#4E31C0] transition-[width] duration-300', PROGRESS_WIDTH[wizard.completedCount] ?? 'w-0')} />
            </div>
        </aside>
    )
}

export default WizardLivePreview
