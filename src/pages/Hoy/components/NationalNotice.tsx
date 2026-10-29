import { useState } from 'react'
import { HeartHandshakeIcon } from 'lucide-react'

import useAuthStore from '@/store/auth'
import { titleCaseName } from '../lib'

const llave = (account?: string) => `eyp:aviso:nacional-acompana:v1:${account ?? ''}`

const yaLoVio = (account?: string) => {
    try { return localStorage.getItem(llave(account)) === '1' } catch { return false }
}

/**
 * «Tu Nacional te acompaña»: su Directora Nacional ve este seguimiento en «Mis Directoras». Se le dice una vez, en su
 * tarjeta de seguimiento, para que no se entere por su Nacional (privacidad, opción A de David, 29-oct-2026).
 */
const NationalNotice = ({ nationalName }: { nationalName: string }) => {
    const account = useAuthStore(state => state.user?.account)
    const [visto, setVisto] = useState(() => yaLoVio(account))

    if (visto) return null

    const entendido = () => {
        try { localStorage.setItem(llave(account), '1') } catch { /* sin almacenamiento: vuelve a salir la próxima vez */ }
        setVisto(true)
    }

    return (
        <div className="hoy-soft mt-3.5 rounded-2xl p-3">
            <p className="flex items-center gap-2 text-[12.5px] font-extrabold">
                <HeartHandshakeIcon className="size-4 shrink-0 text-[#6C47FF] dark:text-[#BBAAFF]" /> Tu Nacional te acompaña
            </p>
            <p className="mt-1 text-[11.5px] leading-snug text-muted-foreground">
                <b className="text-foreground">{titleCaseName(nationalName)}</b>, tu Directora Nacional, ve cómo va este seguimiento:
                el porcentaje de tu unidad al que le llegó algo tuyo y cuántas piezas te faltan por enviar. No ve tus piezas ni los datos de tus consultoras.
            </p>
            <button type="button" onClick={entendido} className="mt-2 h-[30px] cursor-pointer rounded-[10px] bg-card px-3 text-[12px] font-bold text-[#6C47FF] shadow-sm transition-colors hover:bg-card/80 dark:text-[#C4B5FF]">
                Entendido
            </button>
        </div>
    )
}

export default NationalNotice
