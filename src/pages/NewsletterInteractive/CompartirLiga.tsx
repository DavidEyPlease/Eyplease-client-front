import { useEffect, useState } from 'react'
import { CopyIcon, Link2Icon, Loader2Icon, MessageCircleIcon, XIcon } from 'lucide-react'
import { toast } from 'sonner'

import { API_ROUTES } from '@/constants/api'
import { ApiResponse } from '@/interfaces/common'
import HttpService from '@/services/http'

export interface LigaBoletin {
    url: string
    year_month: string
    piel: string
    expires_at: string
    times_opened: number
    last_opened_at: string | null
}

const fecha = (iso: string) => new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })

/**
 * «Compartir con tu unidad»: la liga de su boletín interactivo de ese mes, que su unidad abre en el teléfono sin cuenta
 * y sólo para ver (`/b/{token}`; David, 11-nov-2026). Al abrir el panel se crea (o se alarga la que ya había); desde
 * ahí se copia o se manda por WhatsApp, se ve cuántas veces la abrieron y se puede dejar de compartir.
 */
const CompartirLiga = ({ yearMonth, piel, mes, oculto }: { yearMonth: string, piel: 'p9' | 'p10', mes: string, oculto: boolean }) => {
    const [abierto, setAbierto] = useState(false)
    const [liga, setLiga] = useState<LigaBoletin | null>(null)
    const [cargando, setCargando] = useState(false)

    // Otro mes u otra plantilla: otra liga
    useEffect(() => { setLiga(null); setAbierto(false) }, [yearMonth, piel])

    const abrir = async () => {
        setAbierto(true)
        if (liga) return
        setCargando(true)
        try {
            const res = await HttpService.post<ApiResponse<LigaBoletin>>(API_ROUTES.REPORTS.BOLETIN_DINAMICO_LIGA, { year_month: yearMonth, piel })
            setLiga(res.data)
        } catch {
            toast.error('No se pudo preparar la liga. Intenta de nuevo.')
            setAbierto(false)
        } finally {
            setCargando(false)
        }
    }

    const mensaje = liga ? `Así cerramos ${mes} en la unidad 💗 Ábrelo y míralo completo: ${liga.url}` : ''

    const copiar = async () => {
        if (!liga) return
        try {
            await navigator.clipboard.writeText(liga.url)
            toast.success('Liga copiada: pégala en el grupo de tu unidad.')
        } catch {
            toast.error('No se pudo copiar. Selecciona la liga y cópiala a mano.')
        }
    }

    const dejar = async () => {
        if (!liga) return
        setCargando(true)
        try {
            await HttpService.delete(`${API_ROUTES.REPORTS.BOLETIN_DINAMICO_LIGA}?${new URLSearchParams({ year_month: yearMonth, piel })}`)
            setLiga(null)
            setAbierto(false)
            toast.success('Listo: esa liga ya no abre. Si la vuelves a compartir, sale una nueva.')
        } catch {
            toast.error('No se pudo. Intenta de nuevo.')
        } finally {
            setCargando(false)
        }
    }

    if (oculto) return null

    return (
        <div className="fixed right-3 bottom-4 z-50 flex flex-col items-end gap-2 md:right-6 md:bottom-6">
            {abierto && (
                <div className="w-[min(360px,calc(100vw-24px))] rounded-2xl bg-[#1b0f2b]/95 p-4 text-white shadow-[0_24px_50px_-18px_rgba(0,0,0,.9)] ring-1 ring-white/15 backdrop-blur-md">
                    <div className="flex items-start justify-between gap-3">
                        <p className="text-[15px] font-extrabold">Compartir con tu unidad</p>
                        <button type="button" onClick={() => setAbierto(false)} aria-label="Cerrar" className="-m-1 rounded-full p-1 text-white/70 hover:text-white"><XIcon className="size-4" /></button>
                    </div>
                    <p className="mt-1 text-[12.5px] leading-snug text-white/75">Lo abren en su teléfono, sin cuenta y sólo para ver. Es tu boletín de {mes}, con tu mensaje.</p>
                    {cargando && !liga ? (
                        <div className="mt-4 flex justify-center"><Loader2Icon className="size-5 animate-spin" /></div>
                    ) : liga && (
                        <>
                            <input readOnly value={liga.url} onFocus={e => e.currentTarget.select()} className="mt-3 w-full rounded-xl bg-white/10 px-3 py-2 text-[12.5px] text-white ring-1 ring-white/20 outline-none" />
                            <div className="mt-2.5 grid grid-cols-2 gap-2">
                                <a href={`https://wa.me/?text=${encodeURIComponent(mensaje)}`} target="_blank" rel="noreferrer" className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[#25D366] text-[13px] font-bold text-[#06341f]"><MessageCircleIcon className="size-4" /> WhatsApp</a>
                                <button type="button" onClick={copiar} className="flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-white text-[13px] font-bold text-[#4E31C0]"><CopyIcon className="size-4" /> Copiar liga</button>
                            </div>
                            <p className="mt-3 text-[11.5px] text-white/65">
                                {liga.times_opened ? `La han abierto ${liga.times_opened} ${liga.times_opened === 1 ? 'vez' : 'veces'}. ` : 'Todavía nadie la abre. '}
                                Abre hasta el {fecha(liga.expires_at)}.
                            </p>
                            <button type="button" onClick={dejar} disabled={cargando} className="mt-1.5 cursor-pointer text-[12px] font-semibold text-white/70 underline-offset-2 hover:underline disabled:opacity-50">Dejar de compartir</button>
                        </>
                    )}
                </div>
            )}
            {!abierto && (
                <button type="button" onClick={abrir} className="flex h-11 cursor-pointer items-center gap-2 rounded-full bg-white px-4 text-[13.5px] font-extrabold text-[#4E31C0] shadow-[0_14px_30px_-12px_rgba(0,0,0,.8)] ring-1 ring-black/5">
                    <Link2Icon className="size-4" /> Compartir con tu unidad
                </button>
            )}
        </div>
    )
}

export default CompartirLiga
