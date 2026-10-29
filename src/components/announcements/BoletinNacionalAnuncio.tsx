import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { BadgeCheckIcon, ExternalLinkIcon, SparklesIcon } from 'lucide-react'

import { useBillingEnforcement } from '@/components/billing/enforcement/context'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { APP_ROUTES } from '@/constants/app'
import { NewsletterTypes } from '@/interfaces/common'
import { BOTON, LO_QUE_TRAE_NACIONAL } from '@/pages/Newsletter/showcase/novedad'
import BoletinNacionalShowcase from '@/pages/Newsletter/showcase/BoletinNacionalShowcase'
import { puedeVerBoletinNacional } from '@/pages/NewsletterInteractive/acceso'
import useAuthStore from '@/store/auth'
import '@/pages/Newsletter/interactive-feature.css'

/** Una sola vez por cuenta (en este navegador). `?anuncio=nacional` lo vuelve a enseñar, para revisarlo. */
const CLAVE = 'eyp:anuncio:boletin-nacional:v1'
const visto = (clave: string) => {
    try { return localStorage.getItem(clave) === '1' } catch { return false }
}
const marcar = (clave: string) => {
    try { localStorage.setItem(clave, '1') } catch { /* sin almacenamiento sólo se repite el aviso */ }
}

/**
 * La novedad del boletín NACIONAL interactivo, al entrar a Eyplease+ (David, 26-oct-2026: «como el de unidad, tenemos
 * que poner un aviso»). Sólo a las Directoras Nacionales (es parte de su plan), una vez por cuenta, y nunca encima de
 * otra ventana: si está abierto el aviso del boletín de unidad o el de pago, espera su turno.
 */
const BoletinNacionalAnuncio = () => {
    const user = useAuthStore(state => state.user)
    const newsletters = useAuthStore(state => state.utilData.newsletters)
    const { enforcement } = useBillingEnforcement()
    const [abierto, setAbierto] = useState(false)

    const hasNational = newsletters.some(newsletter => newsletter.code === NewsletterTypes.NATIONAL)
    const puede = puedeVerBoletinNacional(user)
    const clave = user ? `${CLAVE}:${user.account}` : null

    useEffect(() => {
        if (!clave || !hasNational || !puede) return
        if (enforcement.account_blocked || enforcement.show_reminder_popup) return
        const forzar = new URLSearchParams(window.location.search).get('anuncio') === 'nacional'
        if (!forzar && visto(clave)) return

        let intentos = 0
        let espera: ReturnType<typeof setTimeout>
        const intentar = () => {
            // otra ventana abierta (el aviso de unidad, un pago): espera su turno
            if (document.querySelector('[role="dialog"], [role="alertdialog"]')) {
                if (++intentos < 30) espera = setTimeout(intentar, 4000)
                return
            }
            setAbierto(true)
        }
        espera = setTimeout(intentar, 2400)
        return () => clearTimeout(espera)
    }, [clave, hasNational, puede, enforcement.account_blocked, enforcement.show_reminder_popup])

    const cerrar = () => {
        if (clave) marcar(clave)
        setAbierto(false)
    }

    if (!user) return null

    return (
        <Dialog open={abierto} onOpenChange={open => { if (!open) cerrar() }}>
            <DialogContent className="max-h-[94dvh] w-[min(980px,calc(100%-1.5rem))] max-w-none overflow-y-auto rounded-[26px] border-0 bg-transparent p-0 text-white shadow-[0_40px_120px_-30px_rgba(40,20,120,.9)] sm:max-w-none [&>[data-slot=dialog-close]]:z-10 [&>[data-slot=dialog-close]]:text-white">
                <section className="ifx relative overflow-hidden rounded-[26px] p-5 md:p-8">
                    <span className="ifx-aurora" aria-hidden="true"><i /><i /><i /></span>
                    <div className="relative grid items-center gap-7 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
                        <BoletinNacionalShowcase className="ifx-pantalla" />

                        <div className="min-w-0">
                            <span className="ifx-nuevo"><SparklesIcon className="size-3" /> Nuevo · Boletín de Área</span>
                            <DialogTitle asChild>
                                <h2 className="ifx-titulo mt-3">Ahora tu Boletín de Área también es interactivo</h2>
                            </DialogTitle>
                            <DialogDescription className="mt-2 text-[15px] leading-relaxed text-white/85">
                                Además del de tu unidad, ahora el de tu <b className="text-white">Área completa</b>: el Cuadro de Honor de tu área con ceremonia y suspenso, la carrera de las unidades, el auto rosa y las Cortes con sus joyas. Escribe tu mensaje y preséntalo en la junta de tu área o en Zoom, sin descargar nada.
                            </DialogDescription>

                            <ul className="mt-4 flex flex-wrap gap-1.5">
                                {LO_QUE_TRAE_NACIONAL.map((texto, i) => (
                                    <li key={texto} className="ifx-chip" style={{ '--n': i } as React.CSSProperties}>{texto}</li>
                                ))}
                            </ul>

                            <p className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-emerald-400/18 px-3 py-1.5 text-[12px] font-extrabold text-emerald-100 ring-1 ring-emerald-300/40">
                                <BadgeCheckIcon className="size-3.5" /> Ya es parte de tu {user.plan?.name ?? 'Plan Área'}
                            </p>

                            <div className="mt-4 flex flex-wrap gap-2.5">
                                <Link to={APP_ROUTES.HOME.NEWSLETTER_NATIONAL} target="_blank" rel="noopener" onClick={cerrar} className={BOTON}>
                                    Abrir mi Boletín de Área <ExternalLinkIcon className="size-4" />
                                </Link>
                            </div>
                            <p className="mt-2.5 text-[12px] text-white/65">También está en Boletín: elige el Boletín de Área y el formato «Interactivo».</p>
                            <button type="button" onClick={cerrar} className="mt-4 text-[13px] font-bold text-white/70 hover:text-white">Lo veo después</button>
                        </div>
                    </div>
                </section>
            </DialogContent>
        </Dialog>
    )
}

export default BoletinNacionalAnuncio
