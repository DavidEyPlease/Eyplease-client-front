import { CheckIcon, PencilLineIcon } from 'lucide-react'

import { UserRequestStatusTypes } from '@/interfaces/requestService'
import { cn } from '@/lib/utils'
import { isCorrectionStatus, SERVICE_STEPS, STATUS_STEP } from '../../utils'

interface Props {
    status: UserRequestStatusTypes
}

/** Línea de progreso del servicio: los 6 estados proyectados en 4 fases. */
const ServiceStepper = ({ status }: Props) => {
    const currentStep = STATUS_STEP[status]
    const isCorrection = isCorrectionStatus(status)

    return (
        <ol className="flex items-start">
            {SERVICE_STEPS.map((label, index) => {
                const stepNumber = index + 1
                const isDone = stepNumber < currentStep || currentStep === SERVICE_STEPS.length
                const isCurrent = stepNumber === currentStep && !isDone
                const isAlert = isCurrent && isCorrection

                return (
                    <li
                        key={label}
                        className={cn(
                            'relative flex min-w-0 flex-1 flex-col items-center gap-1.5',
                            'not-last:after:absolute not-last:after:top-[11px] not-last:after:left-[calc(50%+16px)] not-last:after:h-0.5 not-last:after:w-[calc(100%-32px)] not-last:after:rounded-full not-last:after:bg-border',
                            isDone && 'not-last:after:bg-primary-gradient-r',
                        )}
                    >
                        <span
                            className={cn(
                                'z-10 grid size-6 place-content-center rounded-full border-2 border-border bg-card text-[10px] font-extrabold text-muted-foreground/60',
                                isDone && 'border-transparent bg-primary-gradient text-white',
                                isCurrent && !isAlert && 'border-primary text-primary ring-4 ring-primary/15',
                                isAlert && 'border-rose-500 bg-rose-50 text-rose-600 ring-4 ring-rose-500/15',
                            )}
                        >
                            {isDone && <CheckIcon className="size-3" aria-hidden />}
                            {isAlert && <PencilLineIcon className="size-3" aria-hidden />}
                            {!isDone && !isAlert && stepNumber}
                        </span>
                        <span
                            className={cn(
                                'text-center text-[10.5px] leading-tight font-bold text-muted-foreground',
                                (isDone || isCurrent) && 'text-foreground',
                                isAlert && 'text-rose-600',
                            )}
                        >
                            {isAlert ? 'Corrigiendo' : label}
                        </span>
                    </li>
                )
            })}
        </ol>
    )
}

export default ServiceStepper
