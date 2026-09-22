import { useState } from 'react'
import { useNavigate } from 'react-router'
import { DownloadIcon, ImageIcon, TrophyIcon } from 'lucide-react'
import { toast } from 'sonner'

import Modal from '@/components/common/Modal'
import { APP_ROUTES } from '@/constants/app'
import useChallenges, { useChallengeDetail } from '@/hooks/useChallenges'
import useFiles from '@/hooks/useFiles'
import { ChallengePiece, ChallengeRow, IChallenge } from '@/interfaces/challenges'
import { cn } from '@/lib/utils'
import { titleCaseName } from '@/pages/Hoy/lib'
import { dayLabel, formatNumber, progressChip, progressPercent, rowUnit, sourceName } from '../helpers'

interface Props {
    /** El reto tal como viene en la lista: pinta la cabecera mientras llega la tabla */
    challenge: IChallenge | null
    onClose: () => void
}

const initials = (name: string) => name.trim().split(/\s+/).slice(0, 2).map(word => word[0]?.toUpperCase() ?? '').join('')
const firstName = (name: string) => titleCaseName(name.trim().split(' ')[0] ?? '')
const messageOf = (error: unknown, fallback: string) => (error as { message?: string })?.message || fallback

/** Detalle de un reto: avance, tabla por persona y, en los de la unidad, premiar a quien llegó. */
const ChallengeDialog = ({ challenge, onClose }: Props) => {
    const navigate = useNavigate()
    const { award, awardingId, remove, removing } = useChallenges()
    const { data: detail, isLoading } = useChallengeDetail(challenge?.id ?? null)
    const [confirmRemove, setConfirmRemove] = useState(false)
    const { downloadFile } = useFiles()

    /* Las piezas del reto (la suya y la de cada ganadora) las fabrica el estudio: se bajan como cualquier archivo */
    const downloadPiece = (piece: ChallengePiece, name: string) => {
        if (piece.uri) downloadFile(piece.uri, `${name}.${piece.ext ?? 'png'}`)
    }

    const current = detail ?? challenge
    const rows = detail?.rows ?? []
    const isUnit = current?.scope === 'unit'

    const close = () => { setConfirmRemove(false); onClose() }

    /* En la web no hay hoja de compartir: se lleva el mensaje copiado, listo para pegarlo en WhatsApp */
    const congratulate = async (row: ChallengeRow) => {
        if (!current) return
        const text = `¡Felicidades, ${firstName(row.name)}! 🎉 Lograste el reto «${current.title}».${current.prize ? ` Tu premio: ${current.prize}.` : ''} ¡Gracias por tu esfuerzo!`
        try {
            await navigator.clipboard.writeText(text)
            toast.success('Mensaje copiado: pégalo en WhatsApp')
        } catch {
            toast.error('No se pudo copiar el mensaje')
        }
    }

    const onAward = async (row: ChallengeRow) => {
        if (!current) return
        try {
            await award({ id: current.id, personId: row.id })
            toast.success(`${firstName(row.name)} quedó premiada`)
        } catch (error) {
            toast.error(messageOf(error, 'No se pudo premiar'))
        }
    }

    const onRemove = async () => {
        if (!current) return
        try {
            await remove(current.id)
            close()
        } catch (error) {
            toast.error(messageOf(error, 'No se pudo quitar'))
        }
    }

    return (
        <Modal open={!!challenge} size="lg" title={isUnit ? 'Reto a mi unidad' : 'Mi reto'} onOpenChange={open => { if (!open) close() }}>
            {current && (
                <div className="grid gap-3.5">
                    <div>
                        <p className="text-[17px] leading-snug font-extrabold tracking-tight">{current.title}</p>
                        {current.description && <p className="mt-0.5 text-[12.5px] text-muted-foreground">{current.description}</p>}
                        {isUnit && (
                            <p className="mt-1 text-[12.5px] text-muted-foreground">
                                Premio: <b className="text-foreground">{current.prize}</b> · {current.is_open ? `hasta el ${dayLabel(current.ends_on)}` : `terminó el ${dayLabel(current.ends_on)}`}
                            </p>
                        )}
                    </div>

                    <div className="rounded-2xl bg-surface-soft px-3.5 py-3">
                        <div className="flex items-baseline justify-between gap-3">
                            <span className="text-[22px] leading-none font-extrabold text-primary">{progressChip(current)}</span>
                            <small className="text-[11.5px] text-muted-foreground">
                                {current.progress.measure === 'percent' ? (current.progress.detail ?? '') : isUnit ? 'ya llegaron a la meta' : current.progress.measure === 'pieces' ? 'piezas enviadas' : 'líderes lo lograron'}
                            </small>
                        </div>
                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-foreground/6">
                            <i className="shell-grad block h-full rounded-full" style={{ width: `${Math.max(progressPercent(current), 3)}%` }} />
                        </div>
                    </div>

                    {/* El kit del reto (anuncio, cómo funciona y recordatorios): lo fabrica el estudio al ponerlo y se queda en
                        Pedidos de diseño. Las piezas de las ganadoras, en cambio, salen en Mi unidad → Retos */}
                    {isUnit && current.piece && (
                        <div className="flex items-center gap-3 rounded-2xl border px-3.5 py-2.5">
                            {current.piece.url
                                ? <img src={current.piece.url} alt="Kit del reto" className="h-14 w-10 shrink-0 rounded-lg object-cover" />
                                : <span className="hoy-soft grid h-14 w-10 shrink-0 place-items-center rounded-lg text-primary"><ImageIcon className="size-4" /></span>}
                            <span className="min-w-0 flex-1 text-[12.5px]">
                                <b className="block">Kit del reto</b>
                                <span className="text-muted-foreground">{current.piece.url ? 'Anuncio, cómo funciona y recordatorios: el kit completo está en Pedidos de diseño.' : 'Se está haciendo; te avisamos en cuanto esté listo.'}</span>
                            </span>
                            {current.piece.url && (
                                <button type="button" onClick={() => downloadPiece(current.piece!, `Reto - ${current.title}`)} className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-primary/25 px-3 py-1.5 text-[11.5px] font-semibold text-primary hover:bg-primary/5">
                                    <DownloadIcon className="size-3.5" /> Descargar
                                </button>
                            )}
                        </div>
                    )}

                    {current.progress.data_missing && (
                        <div className="rounded-2xl bg-amber-500/12 px-3.5 py-3 text-[12.5px] text-amber-800 dark:text-amber-300">
                            El avance sale de tu reporte <b>{sourceName(current)}</b> y este mes todavía no se carga.
                            <button type="button" onClick={() => { close(); navigate(APP_ROUTES.REPORTS) }} className="mt-1 block cursor-pointer font-bold text-primary hover:underline">Ir a mis reportes</button>
                        </div>
                    )}

                    {current.progress.measure !== 'people' ? null : isLoading ? (
                        <div className="grid gap-2">{[0, 1, 2].map(i => <span key={i} className="hoy-skel h-12 rounded-2xl" />)}</div>
                    ) : rows.length === 0 ? (
                        <p className="rounded-2xl border border-dashed px-3.5 py-5 text-center text-[12.5px] text-muted-foreground">
                            {current.progress.data_missing ? 'Cuando se cargue el reporte verás aquí a cada consultora con su avance.' : 'Todavía nadie tiene avance en este reto.'}
                        </p>
                    ) : (
                        <>
                            <ul className="max-h-[42vh] divide-y overflow-y-auto rounded-2xl border">
                                {rows.map(row => (
                                    <li key={row.id} className="flex items-center gap-3 px-3 py-2.5">
                                        {row.photo?.has_photo
                                            ? <img src={row.photo.url} alt="" className="size-9 shrink-0 rounded-full object-cover" />
                                            : <span className="hoy-soft grid size-9 shrink-0 place-items-center rounded-full text-[11px] font-extrabold text-primary">{initials(row.name)}</span>}
                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate text-[13px] font-semibold">{titleCaseName(row.name)}</span>
                                            <span className={cn('block text-[11.5px]', row.done ? 'font-semibold text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground')}>
                                                {current.type === 'leaders_five'
                                                    ? `${row.current} de ${row.goal} ya pidieron`
                                                    : `${formatNumber(row.current)} ${rowUnit(current)} · meta ${formatNumber(row.goal)}`}
                                                {row.done ? ' ✓' : ''}
                                            </span>
                                        </span>
                                        {row.piece && (row.piece.url ? (
                                            <button type="button" title="Descargar su pieza de ganadora" onClick={() => downloadPiece(row.piece!, `Ganadora - ${titleCaseName(row.name)}`)} className="group relative shrink-0 cursor-pointer overflow-hidden rounded-lg border">
                                                <img src={row.piece.url} alt="Su pieza de ganadora" className="h-12 w-8 object-cover" />
                                                <span className="absolute inset-0 grid place-items-center bg-black/35 opacity-0 transition-opacity group-hover:opacity-100"><DownloadIcon className="size-3.5 text-white" /></span>
                                            </button>
                                        ) : (
                                            <span className="shrink-0 text-[10.5px] font-semibold text-muted-foreground">Su pieza<br />se está haciendo</span>
                                        ))}
                                        {isUnit && row.done && (row.awarded ? (
                                            <button type="button" onClick={() => congratulate(row)} className="shrink-0 cursor-pointer rounded-full border border-primary/25 px-3 py-1.5 text-[11.5px] font-semibold text-primary hover:bg-primary/5">Felicitar</button>
                                        ) : (
                                            <button type="button" disabled={awardingId === row.id} onClick={() => onAward(row)} className="hoy-cta flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-[11.5px] font-semibold text-white disabled:opacity-50">
                                                <TrophyIcon className="size-3.5" /> {awardingId === row.id ? 'Premiando…' : 'Premiar'}
                                            </button>
                                        ))}
                                    </li>
                                ))}
                            </ul>
                            {isUnit && <p className="px-1 text-[11px] text-muted-foreground">Sólo aparecen las que ya tienen avance. El dato se actualiza solo cada día con tus reportes.</p>}
                        </>
                    )}

                    {confirmRemove ? (
                        <div className="rounded-2xl border border-red-500/25 bg-red-500/6 px-3.5 py-3 text-[12.5px]">
                            {isUnit
                                ? 'Se quita el reto y su lista de premiadas. El avance de cada consultora no se pierde: sale de sus reportes.'
                                : 'Se quita de tus retos. Puedes pedir otro cuando quieras.'}
                            <div className="mt-2.5 flex justify-end gap-2">
                                <button type="button" onClick={() => setConfirmRemove(false)} className="h-8 cursor-pointer rounded-lg px-3 text-[12px] font-bold text-muted-foreground hover:bg-foreground/5">Cancelar</button>
                                <button type="button" disabled={removing} onClick={onRemove} className="h-8 cursor-pointer rounded-lg bg-red-600 px-3 text-[12px] font-bold text-white disabled:opacity-50">{removing ? 'Quitando…' : 'Quitar reto'}</button>
                            </div>
                        </div>
                    ) : (
                        <button type="button" onClick={() => setConfirmRemove(true)} className="mx-auto cursor-pointer text-[12.5px] font-semibold text-muted-foreground hover:text-red-600">Quitar reto</button>
                    )}
                </div>
            )}
        </Modal>
    )
}

export default ChallengeDialog
