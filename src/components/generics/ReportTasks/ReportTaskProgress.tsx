import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface Props {
    /** 0–100 para progreso real (PPTX); null = indeterminado (PDF). */
    value: number | null
    className?: string
}

// Barra de progreso de la tarea. Con valor conocido reutiliza el <Progress/> de
// shadcn; cuando es indeterminado (PDF) muestra una barra que se desplaza en bucle.
const ReportTaskProgress = ({ value, className }: Props) => {
    if (value === null) {
        return (
            <div
                className={cn(
                    'relative h-2 w-full overflow-hidden rounded-full bg-primary/15',
                    className
                )}
            >
                <div className="absolute inset-y-0 left-0 w-2/5 rounded-full bg-primary animate-indeterminate-bar" />
            </div>
        )
    }

    return <Progress value={value} className={cn('h-2', className)} />
}

export default ReportTaskProgress
