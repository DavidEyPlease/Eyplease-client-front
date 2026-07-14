import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { WizardStepId } from './wizardSteps'

interface Props {
    steps: readonly { id: string; label: string }[]
    currentIndex: number
    isStepValid: (step: WizardStepId) => boolean
    onStepClick: (id: WizardStepId) => void
}

/** Indicador de progreso: círculos numerados, check en los completados (clicables) y línea. */
const WizardStepper = ({ steps, currentIndex, isStepValid, onStepClick }: Props) => (
    <div className="mb-[26px] flex">
        {steps.map((step, i) => {
            const active = i === currentIndex
            const done = i < currentIndex && isStepValid(step.id as WizardStepId)
            return (
                <div key={step.id} className="relative flex flex-1 flex-col items-center gap-[9px]">
                    <button
                        type="button"
                        disabled={!done}
                        onClick={() => done && onStepClick(step.id as WizardStepId)}
                        className={cn(
                            'z-10 grid size-[34px] place-content-center rounded-full border-2 text-sm font-bold transition-all duration-200',
                            active && 'border-transparent bg-primary text-white shadow-[0_0_0_4px_rgba(78,49,192,0.15)]',
                            done && 'cursor-pointer border-primary/40 bg-primary/10 text-primary',
                            !active && !done && 'border-transparent bg-[#f1eff8] text-muted-foreground'
                        )}
                    >
                        {done ? <Check className="size-4" strokeWidth={3} /> : i + 1}
                    </button>
                    <span
                        className={cn(
                            'text-[12.5px] font-semibold transition-colors duration-200',
                            active ? 'text-primary' : done ? 'text-foreground' : 'text-muted-foreground'
                        )}
                    >
                        {step.label}
                    </span>
                    {i < steps.length - 1 && (
                        <span className={cn('absolute left-[calc(50%+21px)] right-[calc(-50%+21px)] top-4 h-0.5', done ? 'bg-primary' : 'bg-[#e2e0ee]')} />
                    )}
                </div>
            )
        })}
    </div>
)

export default WizardStepper
