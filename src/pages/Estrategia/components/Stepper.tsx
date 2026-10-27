import { cn } from '@/lib/utils'
import { pieces } from '../format'

interface Props {
    value: number
    onChange?: (value: number) => void
    /** En vez del número nuevo, sólo el paso: así dos clics seguidos cuentan los dos aunque no se haya pintado */
    onStep?: (delta: 1 | -1) => void
    min?: number
    max?: number | null
    label: string
    className?: string
}

const BUTTON = 'grid size-8 cursor-pointer place-items-center rounded-full bg-[#6C47FF]/10 text-lg leading-none font-bold text-[#4E31C0] transition-colors hover:bg-[#6C47FF]/20 disabled:cursor-default disabled:opacity-35 dark:text-[#BBAAFF]'

/** − n +: «te quedan» en el inventario y cuántas se lleva en una venta. */
const Stepper = ({ value, onChange, onStep, min = 0, max = null, label, className }: Props) => (
    <span className={cn('flex shrink-0 items-center gap-1', className)}>
        <button type="button" aria-label={`Una menos de ${label}`} disabled={value <= min} className={BUTTON}
            onClick={() => onStep ? onStep(-1) : onChange?.(Math.max(min, Math.ceil(value) - 1))}>−</button>
        <output aria-label={`${label}: ${pieces(value)}`} className="min-w-[30px] text-center text-[15px] font-extrabold tabular-nums">{pieces(value)}</output>
        <button type="button" aria-label={`Una más de ${label}`} disabled={max !== null && value >= max} className={BUTTON}
            onClick={() => onStep ? onStep(1) : onChange?.(Math.floor(value) + 1)}>+</button>
    </span>
)

export default Stepper
