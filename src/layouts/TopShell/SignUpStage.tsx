import { X } from 'lucide-react'

import './shell.css'
import './signup.css'
import { Preview } from './AuthStage'

/** La web pública (eyplease.com.mx): de ahí llega casi todo el mundo al registro. */
const WEB_URL = import.meta.env.VITE_WEB_URL || 'https://eyplease.com.mx'

interface Props {
    children: React.ReactNode
    /** Titular de la columna de marca (escritorio). Por defecto, el del acceso. */
    title?: React.ReactNode
    lead?: React.ReactNode
    /** Lo que va debajo del titular. Por defecto, los tres vistazos del acceso. */
    aside?: React.ReactNode
    /** Botón para volver a la web pública */
    showClose?: boolean
}

const Brand = () => (
    <span className="flex items-center gap-3">
        <span className="shell-mark grid size-11 place-items-center rounded-[14px] border border-white/30 bg-white/15 backdrop-blur-sm">
            <img src="/images/isotipo-blanco.png" alt="" className="relative z-[1] w-6" />
        </span>
        <span className="text-[19px] font-extrabold tracking-tight text-white">eyplease<span className="text-[#2CD4D9]">+</span></span>
    </span>
)

/**
 * Marco del registro (alta, cuenta lista y solicitud recibida) con el lenguaje del acceso nuevo:
 * el mismo degradado, las mismas luces y la misma tarjeta, más ancha porque aquí hay pasos.
 * La columna de marca cambia según la pantalla (en el alta, la cuenta que se va armando).
 */
const SignUpStage = ({ children, title, lead, aside, showClose = true }: Props) => (
    <div className="auth-stage relative grid min-h-screen overflow-hidden lg:grid-cols-[1fr_minmax(500px,1fr)]">
        <div className="shell-backdrop"><i className="shell-blob a" /><i className="shell-blob b" /><i className="shell-blob c" /></div>

        {/* Fija mientras la tarjeta se desplaza (el plan es largo); con su propio scroll si la ventana es baja */}
        <aside className="relative z-[1] hidden flex-col px-[clamp(40px,6vw,96px)] lg:sticky lg:top-0 lg:flex lg:h-screen lg:self-start lg:overflow-y-auto">
            <div className="my-auto py-12">
                <Brand />
                <h1 className="auth-rise mt-9 max-w-[480px] text-[42px] leading-[1.05] font-extrabold tracking-[-.03em] text-white" style={{ '--i': 1 } as React.CSSProperties}>
                    {title ?? <>Tu negocio, <span className="bg-gradient-to-r from-white to-[#9DF3F5] bg-clip-text text-transparent">al día.</span></>}
                </h1>
                <p className="auth-rise mt-3.5 max-w-[440px] text-[15.5px] leading-relaxed font-medium text-white/75" style={{ '--i': 2 } as React.CSSProperties}>
                    {lead ?? 'Lo que pasó hoy con tu equipo, tus piezas listas para compartir y un asistente que lo hace contigo.'}
                </p>
                {aside ?? <Preview />}
            </div>
        </aside>

        <main className="relative z-[1] flex flex-col items-center justify-center px-4 pt-6 pb-10 sm:px-6 lg:py-10">
            <div className="mb-5 flex w-full max-w-[500px] items-center justify-between lg:absolute lg:top-6 lg:right-6 lg:mb-0 lg:w-auto">
                <span className="lg:hidden"><Brand /></span>
                {showClose && (
                    <a
                        href={WEB_URL}
                        aria-label="Salir del registro y volver a eyplease.com.mx"
                        className="grid size-10 place-items-center rounded-full border border-white/25 bg-white/12 text-white backdrop-blur-sm transition-colors hover:bg-white/25"
                    >
                        <X className="size-[18px]" />
                    </a>
                )}
            </div>

            <div
                className="auth-rise auth-card w-full max-w-[500px] rounded-[28px] px-5 py-7 text-card-foreground sm:px-9 sm:py-9"
                style={{ '--i': 2 } as React.CSSProperties}
            >
                {children}
            </div>
        </main>
    </div>
)

export default SignUpStage
