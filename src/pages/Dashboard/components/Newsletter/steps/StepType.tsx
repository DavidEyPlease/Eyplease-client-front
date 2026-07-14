import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NewsletterWizard } from '../useNewsletterWizard'
import { NEWSLETTER_TYPE_META } from '../wizardSteps'

/** Paso 1 — elige el tipo de boletín entre los permitidos por el plan. */
const StepType = ({ wizard }: { wizard: NewsletterWizard }) => (
    <div>
        <h3 className="text-[16.5px] font-bold">¿Qué boletín vas a generar?</h3>
        <p className="mb-[18px] text-[13px] text-muted-foreground">Elige el tipo para empezar a armarlo.</p>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            {wizard.newsletters.map(newsletter => {
                const meta = NEWSLETTER_TYPE_META[newsletter.code]
                const Icon = meta.icon
                const selected = wizard.type === newsletter.code
                return (
                    <button
                        key={newsletter.code}
                        type="button"
                        onClick={() => wizard.setType(newsletter.code)}
                        className={cn(
                            'flex items-start gap-3.5 rounded-2xl border-[1.5px] bg-card p-5 text-left transition-all duration-200',
                            selected
                                ? 'border-primary shadow-[0_0_0_3px_rgba(78,49,192,0.14),0_1px_3px_rgba(26,23,48,0.06)]'
                                : 'border-[#e2e0ee] hover:-translate-y-0.5 hover:border-[#d7d3ec] hover:shadow-[0_10px_30px_-12px_rgba(41,27,105,0.22)]'
                        )}
                    >
                        <span className="grid size-11 shrink-0 place-content-center rounded-xl bg-primary/10 text-primary">
                            <Icon className="size-[22px]" />
                        </span>
                        <span className="min-w-0">
                            <span className="block text-[15px] font-bold">{newsletter.name}</span>
                            <span className="mt-0.5 block text-[12.5px] leading-snug text-muted-foreground">{meta.description}</span>
                        </span>
                        <Check className={cn('ml-auto size-5 shrink-0 text-primary transition-opacity duration-200', selected ? 'opacity-100' : 'opacity-0')} />
                    </button>
                )
            })}
        </div>
    </div>
)

export default StepType
