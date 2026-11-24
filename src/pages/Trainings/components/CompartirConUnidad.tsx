import { useState } from 'react'
import { CheckIcon, CopyIcon, Loader2Icon, LockIcon, MessageCircleIcon, UsersIcon } from 'lucide-react'
import { Link } from 'react-router'
import { toast } from 'sonner'

import Modal from '@/components/common/Modal'
import { API_ROUTES } from '@/constants/api'
import { APP_ROUTES } from '@/constants/app'
import { ApiResponse } from '@/interfaces/common'
import { ITraining, UnitLink } from '@/interfaces/trainings'
import type { IUser } from '@/interfaces/users'
import HttpService from '@/services/http'
import useAuthStore from '@/store/auth'

/** Compartir con la Unidad viene en los planes Elite y Área (David, 24-nov-2026). La API pide lo mismo. */
const PLANES = ['elite', 'national']
const planQueComparte = (user?: IUser | null) => !!user?.plan?.plan_key && PLANES.includes(user.plan.plan_key)
/** Sólo las Directoras (quien tiene Unidad); a una consultora no se le ofrece */
const esDirectora = (user?: IUser | null) => user?.plan?.audience !== 'clients'

const hace = (iso: string) => new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })

/**
 * «Compártela con mi Unidad» (David, 24-nov-2026, opción C): la Directora Elite o Área manda la liga de la presentación a
 * su grupo; cada consultora la abre sin cuenta, con el nombre y la foto de su Directora, y puede crear su cuenta gratis
 * ligada a esa Unidad. Aquí ve cuántas veces entraron y quién de su Unidad (las que dieron su número o se registraron).
 * A las de otros planes se les enseña con candado: es parte de lo que trae subir a Elite.
 */
const CompartirConUnidad = ({ training }: { training: ITraining }) => {
    const user = useAuthStore(state => state.user)
    const [abierto, setAbierto] = useState(false)
    const [liga, setLiga] = useState<UnitLink | null>(null)
    const [cargando, setCargando] = useState(false)

    if (!training.unit_share || !training.web_url || !user || !esDirectora(user)) return null

    if (!planQueComparte(user)) {
        return (
            <Link to={`${APP_ROUTES.HOME.PLAN_UPGRADE}?plan=elite`} className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-primary/30 px-3 py-2 text-[12px] font-bold text-primary/80 hover:bg-primary/5">
                <LockIcon className="size-3.5" /> Compártela con tu Unidad · Elite y Área
            </Link>
        )
    }

    const ruta = API_ROUTES.TRAININGS.UNIT_LINK.replace('{id}', training.id)

    const abrir = async () => {
        setAbierto(true)
        setCargando(true)
        try {
            const res = await HttpService.post<ApiResponse<UnitLink>>(ruta, {})
            setLiga(res.data)
        } catch {
            toast.error('No se pudo preparar la liga. Intenta de nuevo.')
            setAbierto(false)
        } finally {
            setCargando(false)
        }
    }

    const mensaje = liga
        ? `Les comparto «${training.title}» 💗 Ábranla en su teléfono, es interactiva: tiene mensajes listos e imágenes para su estado. ${liga.url}`
        : ''

    const copiar = async () => {
        if (!liga) return
        try {
            await navigator.clipboard.writeText(liga.url)
            toast.success('Liga copiada: pégala en el grupo de tu Unidad.')
        } catch {
            toast.error('No se pudo copiar. Selecciona la liga y cópiala a mano.')
        }
    }

    const dejar = async () => {
        setCargando(true)
        try {
            await HttpService.delete(ruta)
            setLiga(null)
            setAbierto(false)
            toast.success('Listo: esa liga ya no abre. Si la vuelves a compartir, sale una nueva.')
        } catch {
            toast.error('No se pudo. Intenta de nuevo.')
        } finally {
            setCargando(false)
        }
    }

    return (
        <>
            <button type="button" onClick={abrir} className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-primary/25 bg-primary/5 px-3 py-2.5 text-[12.5px] font-extrabold text-primary transition-colors hover:bg-primary/10">
                <UsersIcon className="size-3.5" /> Compártela con mi Unidad
            </button>

            <Modal open={abierto} onOpenChange={setAbierto} title="Compártela con tu Unidad" size="md"
                description="Tus consultoras la abren en su teléfono, sin cuenta, con tu nombre y tu foto. Si quieren guardar su avance, crean su cuenta gratis y quedan en tu Unidad.">
                {cargando && !liga ? (
                    <div className="flex justify-center py-8"><Loader2Icon className="size-6 animate-spin text-primary" /></div>
                ) : liga && (
                    <div className="grid gap-4">
                        <input readOnly value={liga.url} onFocus={e => e.currentTarget.select()} className="w-full rounded-xl bg-muted px-3 py-2.5 text-[13px] outline-none" />
                        <div className="grid grid-cols-2 gap-2">
                            <a href={`https://wa.me/?text=${encodeURIComponent(mensaje)}`} target="_blank" rel="noreferrer" className="flex h-11 items-center justify-center gap-1.5 rounded-xl bg-[#25D366] text-[13.5px] font-bold text-[#06341f]"><MessageCircleIcon className="size-4" /> Mandar al grupo</a>
                            <button type="button" onClick={copiar} className="flex h-11 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-primary-gradient text-[13.5px] font-bold text-white"><CopyIcon className="size-4" /> Copiar liga</button>
                        </div>

                        <div className="rounded-2xl border p-4">
                            <p className="text-[13px] font-extrabold">
                                {liga.times_opened ? `Han entrado ${liga.times_opened} ${liga.times_opened === 1 ? 'vez' : 'veces'}` : 'Todavía nadie entra'}
                                {!!liga.totals.registered && ` · ${liga.totals.registered} ${liga.totals.registered === 1 ? 'creó su cuenta' : 'crearon su cuenta'}`}
                            </p>
                            {liga.people.length ? (
                                <ul className="mt-3 grid max-h-56 gap-2 overflow-auto">
                                    {liga.people.map((p, i) => (
                                        <li key={i} className="flex items-center justify-between gap-3 text-[13px]">
                                            <span className="font-semibold">{p.name ?? 'Consultora'}</span>
                                            <span className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
                                                {p.registered && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 font-bold text-emerald-700 dark:text-emerald-300"><CheckIcon className="size-3" /> Cuenta</span>}
                                                {p.last_opened_at && hace(p.last_opened_at)}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="mt-1 text-[12.5px] text-muted-foreground">Aquí verás quién de tu Unidad entró: las que escriben su número de consultora al abrirla o crean su cuenta.</p>
                            )}
                        </div>

                        <button type="button" onClick={dejar} disabled={cargando} className="cursor-pointer justify-self-start text-[12.5px] font-semibold text-muted-foreground underline-offset-2 hover:underline disabled:opacity-50">Dejar de compartir</button>
                    </div>
                )}
            </Modal>
        </>
    )
}

export default CompartirConUnidad
