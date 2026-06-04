import { useEffect, useState } from 'react'
import { AlertTriangle, Brush, CheckCircle2, Cog, Hammer, LucideIcon, PackageCheck } from 'lucide-react'

import { cn } from '@/lib/utils'
import { ReportTask } from '@/services/reports/types'

interface Props {
    status: ReportTask['status']
    /** 0–100 (PPTX) o null (PDF indeterminado): decide la etapa del icono. */
    progress: number | null
}

// Etapas de "construcción": el icono cambia conforme avanza el progreso y cada uno
// trae su propia animación (martilla, pincela, gira, rebota). Da la sensación de
// que algo se está armando paso a paso.
const BUILD_STAGES: { Icon: LucideIcon; className: string }[] = [
    { Icon: Hammer, className: 'origin-bottom animate-hammer' },
    { Icon: Brush, className: 'animate-brush' },
    { Icon: Cog, className: 'animate-spin [animation-duration:2.4s]' },
    { Icon: PackageCheck, className: 'animate-bounce' },
]

const ReportTaskIcon = ({ status, progress }: Props) => {
    // Sin progreso real (PDF), rotamos las etapas por tiempo para que igual "avance".
    const [tick, setTick] = useState(0)
    useEffect(() => {
        if (status !== 'generating' || progress !== null) return
        const timer = setInterval(() => setTick(prev => prev + 1), 2600)
        return () => clearInterval(timer)
    }, [status, progress])

    if (status === 'ready') {
        return (
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-success/15 animate-in zoom-in-50 duration-300">
                <CheckCircle2 className="size-6 text-success animate-in zoom-in-75 duration-500" />
            </span>
        )
    }

    if (status === 'error') {
        return (
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-destructive/10 animate-in zoom-in-50 duration-300">
                <AlertTriangle className="size-6 text-destructive" />
            </span>
        )
    }

    const stageIndex =
        progress === null
            ? tick % BUILD_STAGES.length
            : Math.min(BUILD_STAGES.length - 1, Math.floor((progress / 100) * BUILD_STAGES.length))

    const { Icon, className } = BUILD_STAGES[stageIndex]

    return (
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
            {/* El fundido de entrada va en el wrapper (animate-in) y la animación del
                icono en el <Icon>: si ambas fueran al mismo elemento, compartirían la
                propiedad `animation` y solo una surtiría efecto. key por etapa para
                reiniciar el fundido al cambiar de icono. */}
            <span key={stageIndex} className="flex animate-in fade-in zoom-in-75 duration-300">
                <Icon className={cn('size-6 text-primary', className)} />
            </span>
        </span>
    )
}

export default ReportTaskIcon
