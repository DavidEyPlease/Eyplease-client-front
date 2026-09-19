import { IconBySection } from '@/components/generics/IconBySection'
import { PermissionKeys } from '@/interfaces/permissions'
import { cn } from '@/lib/utils'
import useUnitFollowUp, { ESCALONES } from '@/pages/Dashboard/components/useUnitFollowUp'
import useAuthStore from '@/store/auth'
import { titleCaseName } from '../lib'
import RingMeter from './RingMeter'

/** Cuántas secciones con pendientes caben sin que la tarjeta se vuelva una lista que se ignora. */
const MAX_FILAS = 4

const TAG = 'inline-flex h-[22px] items-center rounded-full px-2.5 text-[10.5px] font-bold tracking-wide whitespace-nowrap'

interface Props {
    /** Elegir una sección con pendientes filtra el feed por ella */
    onPickSection: (section: string) => void
}

/** La columna de la izquierda del Hoy: quién eres y cómo va tu seguimiento. */
const HoyRail = ({ onPickSection }: Props) => {
    const user = useAuthStore(state => state.user)
    const { loading, pendientes, enviadas, cobertura } = useUnitFollowUp()

    const hasCoverage = !!cobertura && cobertura.people_count > 0
    const total = pendientes.reduce((sum, fila) => sum + fila.pendientes, 0)
    const siguiente = cobertura ? ESCALONES.find(escalon => cobertura.percent < escalon.pct) : undefined

    return (
        <>
            {/* La ficha va en horizontal: apilada medía 330 px y, con el seguimiento debajo, la columna
                no cabía en una laptop (lo de abajo no se alcanzaba hasta terminar el feed). */}
            <section className="shell-glass hoy-rise hidden items-center gap-3 rounded-[22px] p-3.5 xl:flex">
                <span className="shell-grad block size-[58px] shrink-0 rounded-full p-0.5">
                    {user?.profile_picture?.url
                        ? <img src={user.profile_picture.url} alt="" className="size-full rounded-full border-2 border-card object-cover" />
                        : <span className="grid size-full place-items-center rounded-full border-2 border-card bg-card text-xl font-extrabold text-primary">{(user?.name ?? '?').charAt(0)}</span>}
                </span>
                <span className="min-w-0 flex-1 leading-tight">
                    <b className="block text-[13.5px] font-extrabold">{titleCaseName(user?.name ?? '')}</b>
                    <small className="block text-[11.5px] text-muted-foreground">{user?.client_role?.name}{user?.account ? ` · ${user.account}` : ''}</small>
                    {user?.plan?.name && <span className={cn(TAG, 'mt-1.5 bg-[#6C47FF]/10 text-[#6C47FF] dark:text-[#BBAAFF]')}>{user.plan.name}</span>}
                </span>
            </section>

            {!loading && (hasCoverage || pendientes.length > 0) && (
                <section className="shell-glass hoy-rise rounded-[22px] p-[18px]" style={{ '--i': 1 } as React.CSSProperties}>
                    <h2 className="text-[15px] font-extrabold tracking-tight">Tu seguimiento</h2>

                    {hasCoverage ? (
                        /* Apilado en la columna angosta; con sitio a lo ancho, el anillo a la izquierda */
                        <div className="mt-3 grid items-center gap-x-5 gap-y-2.5 max-xl:sm:grid-cols-[auto_minmax(0,1fr)]">
                            <div className="grid justify-items-center"><RingMeter percent={cobertura.percent} size={120} /></div>
                            <div>
                            <p className="text-center text-[12px] text-muted-foreground max-xl:sm:text-left max-xl:sm:text-[13px]">
                                <b className="text-foreground">{cobertura.people_reached} de {cobertura.people_count}</b> consultoras recibieron algo tuyo este mes.
                            </p>
                            {/* Escalera, nunca un semáforo: la mediana del padrón está en el 10% y un color
                                de alarma convierte la meta en una nota reprobatoria. */}
                            <ol className="mt-3 grid grid-cols-4 gap-1">
                                {ESCALONES.map(escalon => {
                                    const logrado = cobertura.percent >= escalon.pct
                                    const proximo = escalon === siguiente
                                    return (
                                        <li key={escalon.pct} className={cn(
                                            'rounded-[10px] border px-0.5 py-1.5 text-center text-[9.5px] leading-tight font-bold',
                                            logrado ? 'border-transparent bg-[#6C47FF]/12 text-[#6C47FF] dark:text-[#BBAAFF]'
                                                : proximo ? 'border-[#6C47FF]/45 text-foreground' : 'border-dashed border-border text-muted-foreground/70',
                                        )}>
                                            {escalon.nombre === 'Unidad completa' ? 'Completa' : escalon.nombre}<br />{escalon.pct}%
                                        </li>
                                    )
                                })}
                            </ol>
                            </div>
                        </div>
                    ) : (
                        <p className="mt-1 text-[12.5px] text-muted-foreground">Te preparé el contenido. Sólo falta enviarlo.</p>
                    )}

                    {pendientes.length > 0 && (
                        <>
                            <p className="mt-4 mb-1 text-[10px] font-extrabold tracking-[.12em] text-muted-foreground uppercase">Te falta enviar</p>
                            <ul className="max-xl:sm:grid max-xl:sm:grid-cols-2 max-xl:sm:gap-x-5">
                                {pendientes.slice(0, MAX_FILAS).map(fila => (
                                    <li key={fila.key}>
                                        <button type="button" onClick={() => onPickSection(fila.key)} className="-mx-2 flex w-[calc(100%+16px)] cursor-pointer items-center gap-2.5 rounded-xl px-2 py-1.5 text-left transition-colors hover:bg-foreground/5">
                                            <span className="hoy-soft grid size-8 shrink-0 place-items-center rounded-[10px] text-primary [&_svg]:size-4">
                                                <IconBySection sectionKey={fila.key as PermissionKeys} />
                                            </span>
                                            <span className="min-w-0 flex-1 leading-tight">
                                                <b className="block truncate text-[12.5px] font-bold">{fila.label}</b>
                                                <small className="text-[11px] text-muted-foreground">
                                                    {fila.hoy > 0
                                                        ? `${fila.hoy} ${fila.hoy === 1 ? 'celebra' : 'celebran'} algo hoy`
                                                        : `${fila.pendientes} sin enviar`}
                                                </small>
                                            </span>
                                            {fila.hoy > 0
                                                ? <span className={cn(TAG, 'bg-cyan-500/12 text-cyan-700 dark:text-cyan-300')}>Hoy</span>
                                                : fila.virgen && <span className={cn(TAG, 'bg-amber-500/15 text-amber-700 dark:text-amber-400')}>Nunca</span>}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            <p className="mt-2 border-t border-border pt-2.5 text-[11.5px] text-muted-foreground">
                                {total} {total === 1 ? 'pieza pendiente' : 'piezas pendientes'}
                                {enviadas > 0 && ` · este mes enviaste ${enviadas}`}
                            </p>
                        </>
                    )}
                </section>
            )}
        </>
    )
}

export default HoyRail
