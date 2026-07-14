import { Check, FileText, Presentation } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NewsletterWizard } from '../useNewsletterWizard'
import { ReportFileType } from '../wizardSteps'

const FORMATS: { value: ReportFileType; label: string; icon: typeof FileText }[] = [
    { value: 'pdf', label: 'PDF', icon: FileText },
    { value: 'pptx', label: 'PowerPoint', icon: Presentation },
]

/** Paso 4 — formato de descarga y confirmación final. */
const StepFormat = ({ wizard }: { wizard: NewsletterWizard }) => (
    <div>
        <h3 className="text-[16.5px] font-bold">Formato y confirmación</h3>
        <p className="mb-[18px] text-[13px] text-muted-foreground">Elige cómo descargarlo. Revisa el resumen en la vista en vivo.</p>

        <div className="mb-[18px] inline-flex gap-1 rounded-[14px] border border-[#ecebf3] bg-[#f4f3f9] p-[5px]">
            {FORMATS.map(({ value, label, icon: Icon }) => {
                const selected = wizard.format === value
                return (
                    <button
                        key={value}
                        type="button"
                        onClick={() => wizard.setFormat(value)}
                        className={cn(
                            'inline-flex items-center justify-center gap-2 rounded-[10px] px-[15px] py-2.5 text-[13.5px] font-semibold transition-all duration-200',
                            selected ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
                        )}
                    >
                        <Icon className="size-[18px]" />
                        {label}
                    </button>
                )
            })}
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-[#cdeed7] bg-[#ecfdf3] p-4 text-[13.5px] text-[#166534]">
            <span className="grid size-6 shrink-0 place-content-center rounded-lg bg-[#d6f5e2] text-[#16a34a]">
                <Check className="size-[15px]" strokeWidth={3} />
            </span>
            <span>
                Todo listo. Pulsa <b className="font-semibold">Generar boletín</b> para crearlo y descargarlo.
            </span>
        </div>
    </div>
)

export default StepFormat
