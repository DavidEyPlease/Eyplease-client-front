import { FormEvent, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import { CheckIcon, Loader2Icon, LockIcon, ShieldCheckIcon } from 'lucide-react'
import { toast } from 'sonner'

import { API_ROUTES } from '@/constants/api'
import useFetchQuery from '@/hooks/useFetchQuery'
import useRequestQuery from '@/hooks/useRequestQuery'

interface IntouchStatus {
    has_password: boolean
    /** Con qué cuenta entra el robot (la suya o la invitada) */
    account: string | null
    /** Mary Kay rechazó la que está guardada: el robot no la vuelve a probar hasta que cambie */
    rejected?: boolean
}

/**
 * «Conecta tu Mary Kay» (David, 9-nov-2026: «sí es importante»). La consultora se registraba sólo con su número de Mary
 * Kay, sin su contraseña de InTouch, y el robot sólo baja los pedidos de las cuentas que la tienen
 * (ConsultantOrderService::accountsForRobot): su estrategia y su inventario se quedaban vacíos. Aquí la pone ella misma y
 * va cifrada (`PUT reports/intouch`, la misma que guarda el registro). Nunca se pide por WhatsApp: el bot le manda esta
 * liga (`?conectar=1` la deja con el campo listo). Si ya la tiene, no se enseña.
 *
 * Salvo dos casos (10-nov-2026, Aide DFP684: «no me da chance de meter mi nueva contraseña»): si Mary Kay RECHAZÓ la
 * guardada (`rejected`), sale sola pidiéndole otra; y con `?conectar=1` sale aunque ya tenga una, para cambiarla. Antes
 * se escondía en cuanto había cualquier contraseña, también la mala, y no había dónde corregirla.
 */
const ConnectMaryKay = () => {
    const { response, loading, fetchRetry } = useFetchQuery<IntouchStatus>(API_ROUTES.REPORTS.INTOUCH, { customQueryKey: ['intouch'] })
    const { request, requestState } = useRequestQuery({ onError: () => { } })
    const [params] = useSearchParams()
    const wanted = params.get('conectar') === '1'
    const [password, setPassword] = useState('')
    const [saved, setSaved] = useState(false)
    const box = useRef<HTMLFormElement>(null)
    const input = useRef<HTMLInputElement>(null)
    const status = response?.data ?? null
    const rejected = !!status?.rejected
    const show = !!status && (!status.has_password || rejected || wanted)

    useEffect(() => {
        if (!wanted || !show) return
        box.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        input.current?.focus({ preventScroll: true })
    }, [wanted, show])

    if (saved) {
        return (
            <div role="status" className="flex items-start gap-3 rounded-[22px] border border-[#2CD4D9]/40 bg-[#2CD4D9]/10 p-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-[#2CD4D9]/20 text-[#0E8F94]"><CheckIcon className="size-5" /></span>
                <p className="min-w-0 flex-1 text-[14px] leading-snug">
                    <strong className="block text-[15px] font-extrabold">Listo, ya conectaste tu Mary Kay</strong>
                    Esta noche bajamos tus pedidos. Mañana tu estrategia y tu inventario ya salen con ellos.
                </p>
            </div>
        )
    }
    if (loading || !status || !show) return null

    const title = rejected
        ? 'Mary Kay no aceptó tu contraseña: ponla otra vez'
        : status.has_password
            ? 'Actualiza tu contraseña de Mary Kay'
            : 'Conecta tu Mary Kay para que tus pedidos entren solos'

    const save = async (event: FormEvent) => {
        event.preventDefault()
        const value = password.trim()
        if (value.length < 4) {
            toast.error('Escribe la contraseña con la que entras a Mary Kay InTouch.')
            input.current?.focus()
            return
        }
        try {
            const result = await request('PUT', API_ROUTES.REPORTS.INTOUCH, { password: value })
            if (!result.success) throw new Error(result.message ?? '')
            setPassword('')
            setSaved(true)
            fetchRetry()
        } catch {
            toast.error('No se guardó tu contraseña. Intenta de nuevo.')
        }
    }

    return (
        <form ref={box} onSubmit={save} className="rounded-[22px] border border-[#6C47FF]/30 bg-[#6C47FF]/[.06] p-4 sm:p-5">
            <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-[#6C47FF]/12 text-[#6C47FF] dark:text-[#A894FF]"><LockIcon className="size-5" /></span>
                <div className="min-w-0 flex-1">
                    <p className="text-[15.5px] leading-snug font-extrabold">{title}</p>
                    <p className="mt-1 text-[13.5px] leading-snug text-muted-foreground">
                        Pon la contraseña con la que entras a marykayintouch.com.mx{status.account ? <> (usuario <b className="text-foreground">{status.account}</b>)</> : null}.
                        {rejected
                            ? ' Si no la recuerdas, cámbiala primero allá y pon aquí la nueva. Mientras tanto tus pedidos no entran.'
                            : ' Cada noche bajamos tus pedidos y con ellos te armo tu estrategia y tu inventario.'} No es tu clave de Eyplease+.
                    </p>
                </div>
            </div>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <input
                    ref={input}
                    type="password"
                    autoComplete="off"
                    value={password}
                    onChange={event => setPassword(event.target.value)}
                    placeholder="Tu contraseña de Mary Kay"
                    aria-label="Tu contraseña de Mary Kay"
                    className="h-11 w-full min-w-0 shrink-0 rounded-full border border-border bg-card px-4 text-[14px] outline-none focus:border-[#6C47FF]/60 sm:w-auto sm:flex-1"
                />
                <button type="submit" disabled={requestState.loading} className="flex h-11 min-w-[140px] shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#4E31C0] px-5 text-[14px] font-bold text-white disabled:opacity-70">
                    {requestState.loading ? <Loader2Icon className="size-4 animate-spin" /> : 'Conectar'}
                </button>
            </div>
            <p className="mt-2.5 flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
                <ShieldCheckIcon className="size-4 shrink-0 text-[#2CD4D9]" /> Se guarda cifrada y nadie la ve. Si la cambias en Mary Kay, ponla aquí otra vez.
            </p>
        </form>
    )
}

export default ConnectMaryKay
