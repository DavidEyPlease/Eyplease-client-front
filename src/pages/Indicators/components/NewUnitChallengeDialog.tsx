import { useEffect, useRef, useState } from 'react'
import { FlagIcon, HeartIcon, ImagePlusIcon, Loader2Icon, LucideIcon, ShoppingBagIcon, XIcon } from 'lucide-react'
import { toast } from 'sonner'

import Modal from '@/components/common/Modal'
import { ChallengeType, NewChallenge } from '@/interfaces/challenges'
import { FileTypes } from '@/interfaces/files'
import { cn } from '@/lib/utils'
import useAuthStore from '@/store/auth'
import { sanitizeFileName } from '@/utils'
import { uploadFile } from '@/utils/files'
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

/** Lado mayor de la foto del premio: sobra para que el estudio la ponga en la pieza y pesa poco */
const PRIZE_PHOTO_MAX_SIDE = 2048

/**
 * La foto del premio en JPEG. Siempre se re-codifica: así el estudio recibe un formato que sabe abrir aunque el
 * teléfono la haya guardado en HEIC. Si el navegador no puede abrirla, null.
 */
const toJpeg = async (file: File): Promise<Blob | null> => {
    try {
        const bitmap = await createImageBitmap(file)
        const scale = Math.min(1, PRIZE_PHOTO_MAX_SIDE / Math.max(bitmap.width, bitmap.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(bitmap.width * scale)
        canvas.height = Math.round(bitmap.height * scale)
        const context = canvas.getContext('2d')
        if (!context) return null
        context.fillStyle = '#ffffff'
        context.fillRect(0, 0, canvas.width, canvas.height)
        context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
        bitmap.close()
        return await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9))
    } catch {
        return null
    }
}

/** «Nuevo reto para mi unidad»: qué se mide, la meta, hasta cuándo y el premio que pone ella. */
const NewUnitChallengeDialog = ({ open, saving, error, unitSize, onCreate, onOpenChange }: Props) => {
    const { today, end } = monthBounds()
    const [kind, setKind] = useState<Kind>(KINDS[0])
    const [target, setTarget] = useState<number>(KINDS[0].presets[1])
    const [custom, setCustom] = useState('')
    const [endsOn, setEndsOn] = useState(end)
    const [prize, setPrize] = useState('')
    /* La foto del premio: se sube al elegirla, así al crear sólo viaja su referencia */
    const [photo, setPhoto] = useState<{ uri: string | null, preview: string, uploading: boolean } | null>(null)
    const fileInput = useRef<HTMLInputElement>(null)
    const user = useAuthStore(state => state.user)

    useEffect(() => {
        if (!open) return
        setKind(KINDS[0]); setTarget(KINDS[0].presets[1]); setCustom(''); setEndsOn(end); setPrize(''); setPhoto(null)
        // Sólo al abrir: `end` cambia de identidad en cada pintado pero no de valor
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open])

    const pick = (next: Kind) => { setKind(next); setTarget(next.presets[Math.min(1, next.presets.length - 1)]); setCustom('') }

    const goal = custom ? Number(custom) : target
    const valid = goal >= 1 && prize.trim().length >= 3 && endsOn >= today && endsOn <= end && !photo?.uploading

    const submit = () => valid && onCreate({
        type: kind.type, target: goal, prize: prize.trim(), ends_on: endsOn,
        ...(photo?.uri ? { prize_photo: photo.uri } : {}),
    })

    const choosePhoto = async (file?: File) => {
        /* La carpeta es la del USUARIO (no la de su ficha de red): es la que el servidor comprueba */
        const owner = user?.user_id ?? user?.id
        if (!file || !owner) return

        const jpeg = await toJpeg(file)
        if (!jpeg) return void toast.error('No pude abrir esa foto. Súbela en JPG o PNG.')

        const preview = URL.createObjectURL(jpeg)
        setPhoto({ uri: null, preview, uploading: true })
        try {
            const name = sanitizeFileName(file.name.replace(/\.[^.]+$/, '')).slice(0, 40) || 'premio'
            const filename = `private/challenges/${owner}/${crypto.randomUUID().slice(0, 8)}-${name}.jpg`
            const uri = await uploadFile({ file: new File([jpeg], `${name}.jpg`, { type: 'image/jpeg' }), fileType: FileTypes.USER_REQUESTED_SERVICE, filename })
            setPhoto({ uri, preview, uploading: false })
        } catch {
            setPhoto(null)
            toast.error('No se pudo subir la foto del premio')
        }
    }

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

                {/* El premio sale en la pieza del reto y en las de ganadora: con su foto, el diseño lo enseña tal cual */}
                <Label>Foto del premio (recomendada)</Label>
                <div className="flex items-center gap-3">
                    {photo ? (
                        <span className="relative size-16 shrink-0 overflow-hidden rounded-xl border">
                            <img src={photo.preview} alt="Foto del premio" className="size-full object-cover" />
                            {photo.uploading && <span className="absolute inset-0 grid place-items-center bg-background/60"><Loader2Icon className="size-4 animate-spin text-primary" /></span>}
                        </span>
                    ) : (
                        <button type="button" onClick={() => fileInput.current?.click()} className="grid size-16 shrink-0 cursor-pointer place-items-center rounded-xl border-[1.5px] border-dashed border-primary/40 text-primary hover:bg-primary/5">
                            <ImagePlusIcon className="size-5" />
                        </button>
                    )}
                    <p className="min-w-0 flex-1 text-[11.5px] text-muted-foreground">
                        {photo ? 'Así sale el premio en la pieza del reto y en la de cada ganadora.' : 'Sube una foto del premio (el kit, el producto) para que la pieza lo muestre tal cual. Sin foto, si es un producto Mary Kay se usa su imagen oficial.'}
                    </p>
                    {photo && !photo.uploading && (
                        <button type="button" aria-label="Quitar la foto del premio" onClick={() => setPhoto(null)} className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-lg text-muted-foreground hover:bg-foreground/5 hover:text-foreground">
                            <XIcon className="size-4" />
                        </button>
                    )}
                    <input ref={fileInput} type="file" accept="image/*" hidden onChange={event => { choosePhoto(event.target.files?.[0]); event.target.value = '' }} />
                </div>

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
