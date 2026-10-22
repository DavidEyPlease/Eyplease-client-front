import { Link } from 'react-router'
import { ArrowRightIcon, BadgeCheckIcon, ExternalLinkIcon, LockIcon, SparklesIcon } from 'lucide-react'

import { APP_ROUTES } from '@/constants/app'
import { LIGA_LO_QUIERO } from '@/pages/NewsletterInteractive/acceso'
import BoletinShowcase from '@/pages/Newsletter/showcase/BoletinShowcase'
import { BOTON, BOTON_2, LO_QUE_TRAE } from '@/pages/Newsletter/showcase/novedad'
import useAuthStore from '@/store/auth'
import { reportMonthLabel } from '@/utils/dates'
import './interactive-feature.css'

/**
 * El boletín interactivo, presentado como la novedad que es: el texto y, al lado, el boletín en chiquito corriendo
 * (portada, carrera y Cuadro de Honor). A quien ya lo trae en su plan se le dice que es suyo y se le abre; a los
 * demás planes, con candado: el ejemplo y subir a Elite.
 */
const InteractiveFeature = ({ bloqueado = false }: { bloqueado?: boolean }) => {
    const plan = useAuthStore(state => state.user?.plan?.name)

    return (
        <section className="ifx hoy-rise relative overflow-hidden rounded-[24px] p-5 text-white md:p-7" style={{ '--i': 2 } as React.CSSProperties}>
            <span className="ifx-aurora" aria-hidden="true"><i /><i /><i /></span>
            <div className="relative grid items-center gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)]">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="ifx-nuevo"><SparklesIcon className="size-3" /> Nuevo</span>
                        <span className="text-[10.5px] font-extrabold tracking-[.14em] text-white/70 uppercase">Boletín de unidad · {reportMonthLabel()}</span>
                    </div>
                    <h2 className="ifx-titulo mt-3">Boletín interactivo</h2>
                    <p className="mt-2 max-w-[54ch] text-[15px] leading-relaxed text-white/85">Tu cierre del mes contado como pasó, orden por orden. Preséntalo en tu junta o en Zoom y que tu unidad vea cómo se ganó cada lugar. Sin descargar nada.</p>

                    <ul className="mt-4 flex flex-wrap gap-1.5">
                        {LO_QUE_TRAE.map((texto, i) => (
                            <li key={texto} className="ifx-chip" style={{ '--n': i } as React.CSSProperties}>{texto}</li>
                        ))}
                    </ul>

                    <p className={`mt-5 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-extrabold ${bloqueado ? 'bg-white/12 ring-1 ring-white/25' : 'bg-emerald-400/18 text-emerald-100 ring-1 ring-emerald-300/40'}`}>
                        {bloqueado ? <><LockIcon className="size-3.5" /> Viene en los planes Elite y Nacional</> : <><BadgeCheckIcon className="size-3.5" /> Ya es parte de tu {plan ?? 'plan'}</>}
                    </p>

                    {/* En su propia pestaña: la plataforma sigue abierta donde estaba */}
                    <div className="mt-4 flex flex-wrap gap-2.5">
                        {bloqueado ? (
                            <>
                                <Link to={LIGA_LO_QUIERO} className={BOTON}>
                                    Lo quiero en mi unidad <ArrowRightIcon className="size-4" />
                                </Link>
                                <Link to={`${APP_ROUTES.HOME.NEWSLETTER_INTERACTIVE}?ejemplo=1`} target="_blank" rel="noopener" className={BOTON_2}>
                                    Ver un ejemplo <ExternalLinkIcon className="size-4" />
                                </Link>
                            </>
                        ) : (
                            <Link to={APP_ROUTES.HOME.NEWSLETTER_INTERACTIVE} target="_blank" rel="noopener" className={BOTON}>
                                Abrir mi boletín interactivo <ExternalLinkIcon className="size-4" />
                            </Link>
                        )}
                    </div>
                    {bloqueado && <p className="mt-2.5 text-[12px] text-white/65">Subes a Elite con tu tarjeta y lo abres hoy mismo. El ejemplo es una unidad inventada.</p>}
                </div>

                {/* El boletín en chiquito, corriendo: portada, carrera y Cuadro de Honor */}
                <BoletinShowcase className="ifx-pantalla" />
            </div>
        </section>
    )
}

export default InteractiveFeature
