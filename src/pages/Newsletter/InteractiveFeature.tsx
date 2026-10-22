import { Link } from 'react-router'
import { ExternalLinkIcon, LockIcon, MessageCircleIcon, MonitorPlayIcon, SlidersHorizontalIcon, TrophyIcon } from 'lucide-react'

import { APP_ROUTES } from '@/constants/app'
import { ligaLoQuiero } from '@/pages/NewsletterInteractive/acceso'
import useAuthStore from '@/store/auth'
import { reportMonthLabel } from '@/utils/dates'
import './interactive-feature.css'

const PUNTOS = [
    { icon: TrophyIcon, text: 'La carrera del Cuadro de Honor día por día: quién iba primero y quién la rebasó con su orden.' },
    { icon: MonitorPlayIcon, text: 'Estrellas, descuentos y corazones, Círculo Rosa, iniciadoras, Camino al Éxito, productos y más.' },
    { icon: SlidersHorizontalIcon, text: 'Modo junta para presentarlo en pantalla completa; Tempraneras y tu mensaje, si los quieres.' },
]

/**
 * El boletín dinámico, presentado como lo que es: otra forma de entregar el boletín, no una opción de la
 * plantilla. Por eso va en su propio bloque y no junto al botón de generar.
 * `bloqueado`: su plan no lo trae (viene en Elite y Nacional). Se le enseña igual, con candado, la unidad de ejemplo
 * y cómo pedirlo.
 */
const InteractiveFeature = ({ bloqueado = false }: { bloqueado?: boolean }) => {
    const user = useAuthStore(state => state.user)

    return (
        <section className="ifx hoy-rise relative overflow-hidden rounded-[22px] p-5 text-white md:p-6" style={{ '--i': 2 } as React.CSSProperties}>
            <div className="relative grid items-center gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,360px)]">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex h-[22px] items-center rounded-full bg-[#E5077D] px-2.5 text-[10.5px] font-extrabold tracking-wide uppercase">Nuevo</span>
                        {bloqueado && (
                            <span className="inline-flex h-[22px] items-center gap-1 rounded-full bg-white/14 px-2.5 text-[10.5px] font-extrabold tracking-wide uppercase ring-1 ring-white/25">
                                <LockIcon className="size-3" /> Elite y Nacional
                            </span>
                        )}
                        <span className="text-[10.5px] font-extrabold tracking-[.14em] text-white/70 uppercase">Boletín de unidad · {reportMonthLabel()}</span>
                    </div>
                    <h2 className="mt-2 text-[26px] leading-[1.1] font-extrabold tracking-tight md:text-[30px]">Boletín interactivo</h2>
                    <p className="mt-1.5 max-w-[56ch] text-[14px] text-white/80">El cierre del mes contado como pasó, orden por orden: preséntalo en tu junta o en Zoom y que tu unidad vea cómo se ganó cada lugar. Sin descargar nada.</p>

                    <ul className="mt-4 grid gap-2">
                        {PUNTOS.map(({ icon: Icon, text }) => (
                            <li key={text} className="flex items-start gap-2.5 text-[13px] text-white/85">
                                <span className="mt-px grid size-6 shrink-0 place-items-center rounded-lg bg-white/12"><Icon className="size-3.5" /></span>
                                {text}
                            </li>
                        ))}
                    </ul>

                    {/* En su propia pestaña: la plataforma sigue abierta donde estaba */}
                    {bloqueado ? (
                        <>
                            <div className="mt-5 flex flex-wrap gap-2.5">
                                <Link to={`${APP_ROUTES.HOME.NEWSLETTER_INTERACTIVE}?ejemplo=1`} target="_blank" rel="noopener" className={BOTON}>
                                    Ver un ejemplo <ExternalLinkIcon className="size-4" />
                                </Link>
                                <a href={ligaLoQuiero(user)} target="_blank" rel="noopener" className="inline-flex h-11 items-center gap-2 rounded-[13px] px-5 text-[13.5px] font-extrabold text-white ring-1 ring-white/45 transition-colors hover:bg-white/10">
                                    Lo quiero en mi unidad <MessageCircleIcon className="size-4" />
                                </a>
                            </div>
                            <p className="mt-2.5 text-[12px] text-white/65">Viene en los planes Elite y Nacional. El ejemplo es una unidad inventada: así se vería con la tuya.</p>
                        </>
                    ) : (
                        <Link to={APP_ROUTES.HOME.NEWSLETTER_INTERACTIVE} target="_blank" rel="noopener" className={`mt-5 ${BOTON}`}>
                            Abrir el boletín interactivo <ExternalLinkIcon className="size-4" />
                        </Link>
                    )}
                </div>

                {/* Lo que se va a ver, en chiquito: el podio del Cuadro de Honor */}
                <div className="ifx-stage" aria-hidden>
                    <span className="ifx-kicker">Cuadro de Honor</span>
                    <div className="ifx-podium">
                        <div className="ifx-pd ifx-2"><span className="ifx-av">2</span><i /></div>
                        <div className="ifx-pd ifx-1"><span className="ifx-crown" /><span className="ifx-av">1</span><i /></div>
                        <div className="ifx-pd ifx-3"><span className="ifx-av">3</span><i /></div>
                    </div>
                    <span className="ifx-spark" style={{ left: '18%', top: '22%' }} />
                    <span className="ifx-spark" style={{ left: '78%', top: '18%', animationDelay: '.8s' }} />
                    <span className="ifx-spark" style={{ left: '62%', top: '40%', animationDelay: '1.6s' }} />
                    <span className="ifx-bar"><i /></span>
                </div>
            </div>
        </section>
    )
}

const BOTON = 'inline-flex h-11 items-center gap-2 rounded-[13px] bg-white px-5 text-[13.5px] font-extrabold text-[#4E31C0] shadow-[0_14px_34px_-14px_rgba(0,0,0,.6)] transition-transform hover:-translate-y-0.5'

export default InteractiveFeature
