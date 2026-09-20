import { useState } from 'react'
import { CheckIcon, Loader2Icon } from 'lucide-react'
import { toast } from 'sonner'

import { APP_ROUTES, SESSION_KEY } from '@/constants/app'
import useRequestQuery from '@/hooks/useRequestQuery'
import { ILinkedAccount } from '@/interfaces/auth'
import { cn } from '@/lib/utils'
import useAuthStore from '@/store/auth'

/** Bandera y nombre del país, para reconocer la cuenta de un vistazo. */
const PAISES: Record<string, { bandera: string, nombre: string }> = {
    MEX: { bandera: '🇲🇽', nombre: 'México' },
    COL: { bandera: '🇨🇴', nombre: 'Colombia' },
    USA: { bandera: '🇺🇸', nombre: 'Estados Unidos' },
}

const paisDe = (codigo: string) => PAISES[codigo?.toUpperCase()] ?? { bandera: '🌎', nombre: codigo }

interface Props {
    /** Cómo se pinta: dentro de un menú desplegable o como lista suelta (el muro de cobranza) */
    variant?: 'menu' | 'plain'
    className?: string
}

/**
 * El selector de cuentas de una misma persona.
 *
 * Una Directora con unidad en México y otra en Colombia tiene DOS cuentas, cada una con sus
 * consultoras, sus reportes y su cobro. Esto le deja pasar de una a otra sin cerrar sesión.
 *
 * NO se pinta nada cuando sólo hay una cuenta, que es el caso de casi todas.
 *
 * Al cambiar se RECARGA la página entera a propósito. La alternativa —cambiar el token en
 * caliente— dejaría en pantalla datos de la cuenta anterior: el caché de react-query no lleva la
 * cuenta en sus llaves, es un singleton y sólo se vacía al desmontar el marco. La recarga es la
 * única forma de garantizar que no se cruce ni un dato entre los dos países, que es justo lo que
 * no puede pasar nunca. Cambiar de cuenta es algo que se hace de vez en cuando: el segundo que
 * tarda vale lo que cuesta.
 */
const AccountSwitcher = ({ variant = 'menu', className }: Props) => {
    const user = useAuthStore(state => state.user)
    const [cambiando, setCambiando] = useState<string | null>(null)
    const { request } = useRequestQuery({ onError: () => { } })

    const cuentas = user?.accounts ?? []

    if (cuentas.length < 2) return null

    const cambiar = async (cuenta: ILinkedAccount) => {
        if (cuenta.current || cambiando) return

        if (!cuenta.active) {
            toast.error('Esa cuenta está desactivada.')
            return
        }

        setCambiando(cuenta.id)

        try {
            const respuesta = await request<undefined, { token: string }>(
                'POST',
                `/me/accounts/${cuenta.id}/switch`,
            )

            const token = respuesta?.data?.token

            if (!token) throw new Error('sin token')

            localStorage.setItem(SESSION_KEY, token)

            /* Recarga completa: es lo que garantiza que no quede en memoria nada de la otra cuenta.
               Va al inicio y no a `/`, que no es ninguna ruta: ahí la pantalla queda en blanco hasta
               que /me responde y redirige. En /dashboard el marco pinta su esqueleto desde el
               primer cuadro, porque el token nuevo ya está guardado. */
            window.location.replace(APP_ROUTES.HOME.INITIAL)
        } catch {
            setCambiando(null)
            toast.error('No se pudo cambiar de cuenta. Inténtalo de nuevo.')
        }
    }

    const fila = (cuenta: ILinkedAccount) => {
        const pais = paisDe(cuenta.country)
        const ocupado = cambiando === cuenta.id

        return (
            <button
                key={cuenta.id}
                type="button"
                disabled={cuenta.current || !!cambiando}
                onClick={() => cambiar(cuenta)}
                className={cn(
                    'flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors',
                    cuenta.current ? 'cursor-default bg-primary/[.08]' : 'cursor-pointer hover:bg-foreground/5',
                    !!cambiando && !ocupado && 'opacity-50',
                    !cuenta.active && 'opacity-60',
                )}
            >
                <span aria-hidden className="text-[17px] leading-none">{pais.bandera}</span>
                <span className="min-w-0 flex-1">
                    <b className={cn('block truncate text-[13px] font-bold', cuenta.current && 'text-primary')}>{pais.nombre}</b>
                    <small className="block truncate text-[11px] text-muted-foreground">
                        {cuenta.account}{cuenta.plan ? ` · ${cuenta.plan}` : ''}{!cuenta.active ? ' · desactivada' : ''}
                    </small>
                </span>
                {ocupado
                    ? <Loader2Icon className="size-4 shrink-0 animate-spin text-primary" />
                    : cuenta.current && <CheckIcon className="size-4 shrink-0 text-primary" />}
            </button>
        )
    }

    return (
        <div className={cn('grid gap-0.5', className)}>
            <p className={cn('px-2.5 text-[10.5px] font-bold tracking-wide text-muted-foreground uppercase', variant === 'menu' ? 'pt-1 pb-1' : 'pb-1.5')}>
                Tus cuentas
            </p>
            {cuentas.map(fila)}
        </div>
    )
}

export default AccountSwitcher
