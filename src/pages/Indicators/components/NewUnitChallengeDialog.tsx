import { useEffect, useState } from 'react'
import { FlagIcon, HeartIcon, LucideIcon, ShoppingBagIcon } from 'lucide-react'

import Modal from '@/components/common/Modal'
import { ChallengeType, NewChallenge } from '@/interfaces/challenges'
import { cn } from '@/lib/utils'
import { dayLabel, formatNumber, monthBounds } from '../helpers'

interface Props {
    open: boolean
    saving: boolean
    error: string
    unitSize?: number
    onCreate: (data: NewChallenge) => void
    onOpenChange: (open: boolean) => void
}

interface Kind {
    type: ChallengeType
    icon: LucideIcon
    title: string
    hint: string
    /** Metas de un clic; en puntos además se puede escribir otra */
    presets: number[]
    unit: string
}

/** Sólo lo que hoy se puede medir sin que la consultora haga nada: sale de los reportes de InTouch. */
const KINDS: Kind[] = [
    { type: 'unit_points', icon: ShoppingBagIcon, title: 'Puntos del mes', hint: 'Se mide con tu reporte de Ventas Mensuales Personales (se actualiza cada mañana).', presets: [600, 1800, 3000, 4800], unit: 'puntos' },
    { type: 'unit_hearts', icon: HeartIcon, title: 'Corazones de Círculo Rosa', hint: 'Corazones ganados este mes según Corazones Virtuales (se actualiza a las 11:30).', presets: [1, 2, 3], unit: 'corazones' },
]

const Label = ({ children }: { children: React.ReactNode }) => (
    <p className="mt-4 mb-1.5 text-[10.5px] font-extrabold tracking-widest text-muted-foreground uppercase">{children}</p>
)

const FIELD = 'block rounded-[14px] border-[1.5px] bg-card px-3 py-2 focus-within:border-primary'

/** «Nuevo reto para mi unidad»: qué se mide, la meta, hasta cuándo y el premio que pone ella. */
const NewUnitChallengeDialog = ({ open, saving, error, unitSize, onCreate, onOpenChange }: Props) => {
    const { today, end } = monthBounds()
    const [kind, setKind] = useState<Kind>(KINDS[0])
    const [target, setTarget] = useState<number>(KINDS[0].presets[1])
    const [custom, setCustom] = useState('')
    const [endsOn, setEndsOn] = useState(end)
    const [prize, setPrize] = useState('')

    useEffect(() => {
        if (!open) return
        setKind(KINDS[0]); setTarget(KINDS[0].presets[1]); setCustom(''); setEndsOn(end); setPrize('')
        // Sólo al abrir: `end` cambia de identidad en cada pintado pero no de valor
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open])

    const pick = (next: Kind) => { setKind(next); setTarget(next.presets[Math.min(1, next.presets.length - 1)]); setCustom('') }

    const goal = custom ? Number(custom) : target
    const valid = goal >= 1 && prize.trim().length >= 3 && endsOn >= today && endsOn <= end

    const submit = () => valid && onCreate({ type: kind.type, target: goal, prize: prize.trim(), ends_on: endsOn })

    return (
        <Modal
            open={open}
            size="lg"
            title="Nuevo reto para mi unidad"
            description="Tú pones la meta y el premio. El avance de cada consultora se llena solo con tus reportes."
            onOpenChange={onOpenChange}
        >
            <div className="-mt-3">
                <Label>Qué se mide</Label>
                <div className="grid grid-cols-2 gap-2">
                    {KINDS.map(option => (
                        <button
                            key={option.type}
                            type="button"
                            onClick={() => pick(option)}
                            className={cn('flex cursor-pointer items-center gap-2.5 rounded-2xl border-[1.5px] px-3 py-2.5 text-left transition-colors', kind.type === option.type ? 'border-primary bg-primary/6' : 'bg-card hover:border-primary/40')}
                        >
                            <option.icon className="size-[18px] shrink-0 text-primary" />
                            <span className="text-[13px] leading-tight font-bold">{option.title}</span>
                        </button>
                    ))}
                </div>
                <p className="mt-1.5 px-1 text-[11.5px] text-muted-foreground">{kind.hint}</p>

                <Label>Meta por consultora</Label>
                <div className="flex flex-wrap gap-1.5">
                    {kind.presets.map(preset => (
                        <button
                            key={preset}
                            type="button"
                            onClick={() => { setTarget(preset); setCustom('') }}
                            className={cn('cursor-pointer rounded-full px-3.5 py-2 text-xs font-semibold transition-colors', !custom && target === preset ? 'bg-primary text-white' : 'border border-primary/25 text-primary hover:bg-primary/5')}
                        >
                            {formatNumber(preset)} {kind.unit}
                        </button>
                    ))}
                    {kind.type === 'unit_points' && (
                        <input
                            inputMode="numeric"
                            value={custom}
                            onChange={event => setCustom(event.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="Otra"
                            aria-label="Otra meta en puntos"
                            className={cn('w-20 rounded-full border bg-card px-3.5 py-2 text-xs font-semibold outline-none', custom ? 'border-primary' : 'border-primary/25')}
                        />
                    )}
                </div>

                <div className="grid gap-x-3 sm:grid-cols-[200px_minmax(0,1fr)]">
                    <div>
                        <Label>Hasta cuándo</Label>
                        <label className={FIELD}>
                            <small className="block text-[10.5px] font-bold tracking-wider text-muted-foreground uppercase">Termina el {endsOn ? dayLabel(endsOn) : '—'}</small>
                            <input type="date" value={endsOn} min={today} max={end} onChange={event => setEndsOn(event.target.value)} className="min-h-[22px] w-full bg-transparent text-sm font-semibold outline-none" />
                        </label>
                    </div>
                    <div>
                        <Label>Premio (lo pones tú)</Label>
                        <label className={FIELD}>
                            <small className="block text-[10.5px] font-bold tracking-wider text-muted-foreground uppercase">Qué se gana</small>
                            <input value={prize} maxLength={120} onChange={event => setPrize(event.target.value)} placeholder="Set de brochas + reconocimiento en el boletín" className="min-h-[22px] w-full bg-transparent text-sm font-semibold outline-none placeholder:font-medium placeholder:text-muted-foreground/60" />
                        </label>
                    </div>
                </div>
                <p className="mt-1 px-1 text-[11.5px] text-muted-foreground">Los retos viven dentro del mes: puntos y corazones se cuentan por mes y el día 1 vuelven a cero.</p>

                <p className="mt-4 rounded-2xl bg-surface-soft px-3.5 py-3 text-[12.5px]">
                    Participa <b>toda tu unidad</b>{unitSize ? <> ({unitSize} consultoras)</> : null}. Gana quien llegue a <b>{formatNumber(goal || 0)} {kind.unit}</b> antes del {endsOn ? dayLabel(endsOn) : '—'}.
                </p>

                {error && <p role="alert" className="mt-2 px-1 text-xs text-red-600">{error}</p>}

                <button type="button" disabled={!valid || saving} onClick={submit} className="hoy-cta mt-3 flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-[13px] text-sm font-bold text-white disabled:cursor-default disabled:opacity-50">
                    <FlagIcon className="size-4" /> {saving ? 'Creando…' : 'Poner el reto'}
                </button>
            </div>
        </Modal>
    )
}

export default NewUnitChallengeDialog
