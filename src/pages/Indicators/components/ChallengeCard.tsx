import { FlagIcon, TargetIcon } from 'lucide-react'

import { IChallenge } from '@/interfaces/challenges'
import { cn } from '@/lib/utils'
import { dayLabel, progressChip, progressPercent } from '../helpers'

interface Props {
    challenge: IChallenge
    onOpen: (challenge: IChallenge) => void
}

/** Tarjeta de un reto: qué es, cuánto lleva y, si es de la unidad, el premio y hasta cuándo. */
const ChallengeCard = ({ challenge, onOpen }: Props) => {
    const { progress } = challenge
    const isUnit = challenge.scope === 'unit'
    const reached = isUnit ? progress.current > 0 : progress.done
    const Icon = isUnit ? FlagIcon : TargetIcon

    const footer = progress.data_missing
        ? 'Falta cargar el reporte de este mes'
        : isUnit
            ? progress.current ? `${progress.current} ya ${progress.current === 1 ? 'llegó' : 'llegaron'} a la meta` : 'Nadie ha llegado todavía'
            : progress.done ? '¡Reto cumplido!'
                : progress.measure === 'people' ? `${progress.current} de ${progress.goal} líderes ya lo lograron`
                    : progress.measure === 'pieces' ? `${progress.current} de ${progress.goal} piezas enviadas`
                        : (progress.detail ?? 'Abre para ver el detalle')

    return (
        <button type="button" onClick={() => onOpen(challenge)} className="block w-full cursor-pointer rounded-2xl border border-border bg-card/60 p-4 text-left transition-colors hover:border-[#6C47FF]/40">
            <span className="flex items-start gap-2.5">
                <span className="hoy-soft grid size-9 shrink-0 place-items-center rounded-xl text-primary"><Icon className="size-[17px]" /></span>
                <span className="min-w-0 flex-1">
                    <b className="block text-[14px] leading-snug font-extrabold">{challenge.title}</b>
                    {isUnit && (
                        <small className="block text-[12px] text-muted-foreground">
                            Premio: <b className="text-foreground">{challenge.prize}</b> · {challenge.is_open ? `hasta el ${dayLabel(challenge.ends_on)}` : `terminó el ${dayLabel(challenge.ends_on)}`}
                        </small>
                    )}
                </span>
                <span className={cn('shrink-0 rounded-full px-2.5 py-1 text-[10.5px] font-extrabold tracking-wide whitespace-nowrap', reached ? 'bg-emerald-500/14 text-emerald-700 dark:text-emerald-400' : 'bg-amber-500/15 text-amber-700 dark:text-amber-400')}>
                    {progressChip(challenge)}
                </span>
            </span>
            <span className="mt-3 mb-2 block h-1.5 overflow-hidden rounded-full bg-foreground/6">
                <i className="shell-grad block h-full rounded-full transition-[width] duration-1000" style={{ width: `${Math.max(progressPercent(challenge), 3)}%` }} />
            </span>
            <span className="block text-[12px] text-muted-foreground">{footer}</span>
        </button>
    )
}

export default ChallengeCard
