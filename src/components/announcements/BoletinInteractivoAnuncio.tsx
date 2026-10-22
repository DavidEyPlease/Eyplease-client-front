import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { ArrowRightIcon, BadgeCheckIcon, ExternalLinkIcon, LockIcon, SparklesIcon } from 'lucide-react'

import { useBillingEnforcement } from '@/components/billing/enforcement/context'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { APP_ROUTES } from '@/constants/app'
import { NewsletterTypes } from '@/interfaces/common'
import { BOTON, BOTON_2, LO_QUE_TRAE } from '@/pages/Newsletter/showcase/novedad'
import BoletinShowcase from '@/pages/Newsletter/showcase/BoletinShowcase'
import { LIGA_LO_QUIERO, ofrecerBoletinDinamico, puedeVerBoletinDinamico } from '@/pages/NewsletterInteractive/acceso'
import useAuthStore from '@/store/auth'
import '@/pages/Newsletter/interactive-feature.css'

/** Una sola vez por cuenta (en este navegador). `?anuncio=1` lo vuelve a enseñar, para revisarlo. */
const CLAVE = 'eyp:anuncio:boletin-interactivo:v1'
const visto = (clave: string) => {
    try { return localStorage.getItem(clave) === '1' } catch { return false }
}
const marcar = (clave: string) => {
    try { localStorage.setItem(clave, '1') } catch { /* sin almacenamiento sólo se repite el aviso */ }
}

/**
 * La novedad del boletín interactivo, al entrar a Eyplease+ (David, 22-oct-2026: «que le salga a todos para que lo
 * conozcan»). A las de Elite y Nacional se les dice que ya es parte de su plan y se les abre; a las demás Directoras,
 * con candado: subir a Elite o ver el ejemplo. Sale con el mismo candado de prueba que el boletín (`acceso.ts`), una
 * vez por cuenta, y no se encima con el aviso de pago ni con otra ventana abierta.
 */
const BoletinInteractivoAnuncio = () => {
    const user = useAuthStore(state => state.user)
    const newsletters = useAuthStore(state => state.utilData.newsletters)
    const { enforcement } = useBillingEnforcement()
    const navigate = useNavigate()
    const [abierto, setAbierto] = useState(false)

    const hasUnity = newsletters.some(newsletter => newsletter.code === NewsletterTypes.UNITY)
    const puede = puedeVerBoletinDinamico(user)
    const ofrecer = ofrecerBoletinDinamico(user)
    const clave = user ? `${CLAVE}:${user.account}` : null

    useEffect(() => {
        if (!clave || !hasUnity || !(puede || ofrecer)) return
        if (enforcement.account_blocked || enforcement.show_reminder_popup) return
        const forzar = new URLSearchParams(window.location.search).get('anuncio') === '1'
        if (!forzar && visto(clave)) return

        let intentos = 0
        let espera: ReturnType<typeof setTimeout>
        const intentar = () => {
            // otra ventana abierta (un aviso, un pago): espera su turno
            if (document.querySelector('[role="dialog"], [role="alertdialog"]')) {
                if (++intentos < 6) espera = setTimeout(intentar, 4000)
                return
            }
            setAbierto(true)
        }
        espera = setTimeout(intentar, 1600)
        return () => clearTimeout(espera)
    }, [clave, hasUnity, puede, ofrecer, enforcement.account_blocked, enforcement.show_reminder_popup])

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
                        <BoletinShowcase className="ifx-pantalla" />

                        <div className="min-w-0">
                            <span className="ifx-nuevo"><SparklesIcon className="size-3" /> Nuevo en Eyplease+</span>
                            <DialogTitle asChild>
                                <h2 className="ifx-titulo mt-3">Tu boletín ahora es interactivo</h2>
                            </DialogTitle>
                            <DialogDescription className="mt-2 text-[15px] leading-relaxed text-white/85">
                                Tu cierre del mes contado como pasó, orden por orden: la carrera día por día, quién rebasó a quién y cómo se ganó cada lugar. Preséntalo en tu junta o en Zoom, sin descargar nada.
                            </DialogDescription>

                            <ul className="mt-4 flex flex-wrap gap-1.5">
                                {LO_QUE_TRAE.map((texto, i) => (
                                    <li key={texto} className="ifx-chip" style={{ '--n': i } as React.CSSProperties}>{texto}</li>
                                ))}
                            </ul>

                            <p className={`mt-5 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-extrabold ${puede ? 'bg-emerald-400/18 text-emerald-100 ring-1 ring-emerald-300/40' : 'bg-white/12 ring-1 ring-white/25'}`}>
                                {puede ? <><BadgeCheckIcon className="size-3.5" /> Ya es parte de tu {user.plan?.name ?? 'plan'}</> : <><LockIcon className="size-3.5" /> Viene en los planes Elite y Nacional</>}
                            </p>

                            <div className="mt-4 flex flex-wrap gap-2.5">
                                {puede ? (
                                    <Link to={APP_ROUTES.HOME.NEWSLETTER_INTERACTIVE} target="_blank" rel="noopener" onClick={cerrar} className={BOTON}>
                                        Abrir mi boletín interactivo <ExternalLinkIcon className="size-4" />
                                    </Link>
                                ) : (
                                    <>
                                        <button type="button" onClick={() => { cerrar(); navigate(LIGA_LO_QUIERO) }} className={BOTON}>
                                            Lo quiero en mi unidad <ArrowRightIcon className="size-4" />
                                        </button>
                                        <Link to={`${APP_ROUTES.HOME.NEWSLETTER_INTERACTIVE}?ejemplo=1`} target="_blank" rel="noopener" onClick={cerrar} className={BOTON_2}>
                                            Ver un ejemplo <ExternalLinkIcon className="size-4" />
                                        </Link>
                                    </>
                                )}
                            </div>
                            {!puede && <p className="mt-2.5 text-[12px] text-white/65">Subes a Elite con tu tarjeta y lo abres hoy mismo.</p>}
                            <button type="button" onClick={cerrar} className="mt-4 text-[13px] font-bold text-white/70 hover:text-white">Lo veo después</button>
                        </div>
                    </div>
                </section>
            </DialogContent>
        </Dialog>
    )
}

export default BoletinInteractivoAnuncio
