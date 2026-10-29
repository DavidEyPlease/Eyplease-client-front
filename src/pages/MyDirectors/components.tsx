import { MessageCircleIcon, SendIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { ESCALONES } from '@/pages/Dashboard/components/useUnitFollowUp'
import RingMeter from '@/pages/Hoy/components/RingMeter'
import { haceCuanto, iniciales, ligaWhatsApp, mensajeDeInvitacion, mensajeParaDirectora, sinEnviarHaceMucho } from './lib'
import type { AreaDirector } from './useAreaDirectors'

export const TAG = 'inline-flex h-[22px] items-center rounded-full px-2.5 text-[10.5px] font-bold tracking-wide whitespace-nowrap'

/** Cuántas secciones pendientes caben en la tarjeta antes de «+N más». */
const MAX_SECCIONES = 3

export const Avatar = ({ director, size = 40 }: { director: AreaDirector, size?: number }) => (
    director.photo
        ? <img src={director.photo} alt="" loading="lazy" className="shrink-0 rounded-full object-cover" style={{ width: size, height: size }} />
        : <span className="grid shrink-0 place-items-center rounded-full bg-foreground/6 text-[12px] font-extrabold text-muted-foreground" style={{ width: size, height: size }}>{iniciales(director.name)}</span>
)

/** La escalera de su unidad, la misma de su Hoy: nunca un semáforo. */
export const Escalera = ({ percent }: { percent: number }) => {
    const siguiente = ESCALONES.find(escalon => percent < escalon.pct)
    return (
        <ol className="grid grid-cols-4 gap-1">
            {ESCALONES.map(escalon => (
                <li key={escalon.pct} className={cn(
                    'rounded-[9px] border px-0.5 py-1 text-center text-[9.5px] leading-tight font-bold',
                    percent >= escalon.pct ? 'border-transparent bg-[#6C47FF]/12 text-[#6C47FF] dark:text-[#BBAAFF]'
                        : escalon === siguiente ? 'border-[#6C47FF]/45 text-foreground' : 'border-dashed border-border text-muted-foreground/70',
                )}>
                    {escalon.nombre === 'Unidad completa' ? 'Completa' : escalon.nombre}<br />{escalon.pct}%
                </li>
            ))}
        </ol>
    )
}

const BOTON = 'inline-flex h-[32px] shrink-0 cursor-pointer items-center gap-1.5 rounded-[11px] border border-[#6C47FF]/30 bg-card px-3 text-[12px] font-bold text-[#6C47FF] transition-colors hover:bg-[#6C47FF]/8 dark:text-[#C4B5FF]'

/** Una Directora que usa Eyplease+: su anillo, su escalón, lo que le falta por sección y cuándo envió por última vez. */
export const DirectorCard = ({ director, style }: { director: AreaDirector, style?: React.CSSProperties }) => {
    const app = director.app
    if (!app) return null
    const { percent, people_reached, people_count } = app.coverage
    const atrasada = sinEnviarHaceMucho(director)
    const felicitar = percent >= 75

    return (
        <article className="shell-glass hoy-rise flex flex-col rounded-[20px] p-4" style={style}>
            <div className="flex items-center gap-3">
                <RingMeter percent={percent} size={56} stroke={6} label="">
                    <b className="text-[13px] font-extrabold tabular-nums">{percent}%</b>
                </RingMeter>
                <span className="min-w-0 flex-1 leading-tight">
                    <b className="line-clamp-2 block text-[14px] font-extrabold">{director.name}</b>
                    <small className="block text-[11.5px] text-muted-foreground">
                        {people_count > 0 ? <>Llegó a <b className="text-foreground">{people_reached} de {people_count}</b> consultoras</> : 'Sin piezas este mes todavía'}
                        {app.plan ? ` · ${app.plan}` : ''}
                    </small>
                </span>
            </div>

            {/* El escalón que ya alcanzó se lee en la escalera: sin etiqueta aparte, el nombre cabe entero en el teléfono */}
            <div className="mt-3"><Escalera percent={percent} /></div>

            {app.pending_total > 0 ? (
                <>
                    <p className="mt-3 text-[9.5px] font-extrabold tracking-[.12em] text-muted-foreground uppercase">Le falta enviar · {app.pending_total}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {app.pending.slice(0, MAX_SECCIONES).map(seccion => (
                            <span key={seccion.key} className="hoy-soft inline-flex h-6 items-center gap-1 rounded-lg px-2 text-[11px] font-semibold">
                                {seccion.label} <b className="font-extrabold text-[#6C47FF] dark:text-[#BBAAFF]">{seccion.count}</b>
                            </span>
                        ))}
                        {app.pending.length > MAX_SECCIONES && (
                            <span className="inline-flex h-6 items-center rounded-lg bg-foreground/5 px-2 text-[11px] font-semibold text-muted-foreground">+{app.pending.length - MAX_SECCIONES} más</span>
                        )}
                    </div>
                </>
            ) : (
                <p className="mt-3 text-[12px] text-muted-foreground">No tiene nada pendiente por enviar.</p>
            )}

            {/* En la rejilla las tarjetas miden lo mismo: el pie se va abajo */}
            <div className="min-h-3 flex-1" />
            <div className="flex items-center gap-2 border-t border-border pt-3">
                <small className="min-w-0 flex-1 text-[11px] text-muted-foreground">
                    {atrasada
                        ? <span className={cn(TAG, 'bg-amber-500/15 text-amber-700 dark:text-amber-400')}>{app.last_sent_at ? `Sin enviar desde ${haceCuanto(app.last_sent_at)}` : 'Todavía no envía nada'}</span>
                        : `Último envío: ${haceCuanto(app.last_sent_at!)}`}
                </small>
                <a href={ligaWhatsApp(director.phone, mensajeParaDirectora(director))} target="_blank" rel="noreferrer" className={BOTON}>
                    <MessageCircleIcon className="size-[14px]" /> {felicitar ? 'Felicitarla' : 'Escribirle'}
                </a>
            </div>
        </article>
    )
}

/**
 * Una Directora del Área que todavía no está en Eyplease+: el tamaño de su unidad e «Invítala». El enlace abre WhatsApp
 * en el mismo toque (si se esperara a la API el navegador lo bloquea) y `onInvite` la anota como su invitación.
 */
export const InviteRow = ({ director, link, onInvite }: { director: AreaDirector, link: string | null, onInvite: (director: AreaDirector) => void }) => (
    <li className="flex items-center gap-3 rounded-2xl border border-dashed border-border bg-card/50 px-3 py-2.5">
        <Avatar director={director} size={38} />
        <span className="min-w-0 flex-1 leading-tight">
            <b className="line-clamp-2 block text-[13px] font-bold">{director.name}</b>
            <small className="text-[11.5px] text-muted-foreground">{director.unit_size ? `Unidad de ${director.unit_size} consultoras` : 'Directora de tu Área'}</small>
            {director.invited_at && (
                <span className={cn(TAG, 'mt-1 bg-emerald-500/12 text-emerald-700 dark:text-emerald-400')}>
                    Invitada {haceCuanto(director.last_invited_at ?? director.invited_at)}
                </span>
            )}
        </span>
        <a href={ligaWhatsApp(director.phone, mensajeDeInvitacion(director, link))} target="_blank" rel="noreferrer" onClick={() => onInvite(director)} className={BOTON}>
            <SendIcon className="size-[13px]" /> {director.invited_at ? 'Otra vez' : 'Invítala'}
        </a>
    </li>
)
