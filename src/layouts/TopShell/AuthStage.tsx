import './shell.css'

const Orb = ({ className }: { className: string }) => (
    <span className={`shell-grad shell-orb grid shrink-0 place-items-center rounded-full ${className}`}>
        <img src="/images/isotipo-blanco.png" alt="" className="relative w-1/2" />
    </span>
)

/** Tres vistazos de lo que hay dentro, dibujados en CSS: nada de capturas ni de piezas con logo. */
const Preview = () => (
    <div className="relative mt-12 hidden h-[372px] w-full max-w-[540px] lg:block" aria-hidden>
        {/* Hoy: una tarjeta del feed */}
        <div className="auth-float auth-glass absolute top-0 left-0 w-[268px] rounded-[22px] p-3.5" style={{ '--d': '0s' } as React.CSSProperties}>
            <div className="flex items-center gap-2.5">
                <span className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-white/70 to-white/20 p-[2px]"><i className="block size-full rounded-full bg-white/25" /></span>
                <span className="min-w-0"><b className="block text-[12.5px] font-bold text-white">Hoy en tu equipo</b><small className="block text-[11px] text-white/60">3 reconocimientos nuevos</small></span>
                <span className="ml-auto rounded-full bg-[#E5077D] px-2 py-0.5 text-[9.5px] font-bold text-white">EN VIVO</span>
            </div>
            <div className="mt-3 h-[120px] rounded-2xl bg-gradient-to-br from-white/30 via-white/10 to-[#2CD4D9]/30" />
            <div className="mt-3 flex items-center gap-2">
                <span className="h-8 flex-1 rounded-xl bg-white text-center text-[11.5px] leading-8 font-bold text-[#4E31C0]">Compartir</span>
                <span className="size-8 rounded-xl bg-white/15" /><span className="size-8 rounded-xl bg-white/15" />
            </div>
        </div>

        {/* El Asistente */}
        <div className="auth-float auth-glass absolute top-[64px] right-0 z-[1] w-[244px] rounded-[22px] p-3.5" style={{ '--d': '-2.2s' } as React.CSSProperties}>
            <div className="flex items-center gap-2.5"><Orb className="size-8" /><b className="text-[12.5px] font-bold text-white">Asistente</b></div>
            <p className="mt-2.5 rounded-2xl rounded-tl-md bg-white/15 px-3 py-2 text-[11.5px] leading-snug text-white/90">Hoy te faltan 4 piezas por compartir. ¿Te las bajo todas?</p>
            <p className="mt-1.5 ml-auto w-fit rounded-2xl rounded-br-md bg-white px-3 py-2 text-[11.5px] font-semibold text-[#4E31C0]">Sí, por favor</p>
            <span className="auth-typing mt-1.5 inline-flex gap-1 rounded-2xl bg-white/15 px-3 py-2.5"><i /><i /><i /></span>
        </div>

        {/* Seguimiento */}
        <div className="auth-float auth-glass absolute bottom-0 left-[120px] z-[2] flex w-[280px] items-center gap-3.5 rounded-[22px] p-3.5" style={{ '--d': '-4.1s' } as React.CSSProperties}>
            <svg width="64" height="64" viewBox="0 0 64 64" className="-rotate-90">
                <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,.18)" strokeWidth="7" />
                <circle cx="32" cy="32" r="26" fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" strokeDasharray="163.4" className="auth-ring" />
            </svg>
            <span><b className="block text-[19px] leading-none font-extrabold text-white">62%</b><small className="mt-1 block text-[11px] text-white/65">de tu equipo recibió algo tuyo este mes</small></span>
        </div>
    </div>
)

/**
 * Marco nuevo de las pantallas de acceso (entrar, recuperar contraseña, código, registro).
 *
 * Como en el área autenticada, cambia SÓLO el marco: cada pantalla sigue pasando su formulario
 * como `children`, así que ninguna se toca. Copy NEUTRO, como el login nuevo de la app: nada de
 * «Mary Kay» ni «Unidad» en la puerta, porque por aquí también entrarán consultoras y, más
 * adelante, otras empresas.
 */
const AuthStage = ({ children }: { children: React.ReactNode }) => (
    <div className="auth-stage relative grid min-h-screen overflow-hidden lg:grid-cols-[1.1fr_1fr]">
        <div className="shell-backdrop"><i className="shell-blob a" /><i className="shell-blob b" /><i className="shell-blob c" /></div>

        <aside className="relative z-[1] hidden flex-col justify-center px-[clamp(40px,6vw,96px)] py-12 lg:flex">
            <div className="flex items-center gap-3">
                <span className="shell-mark grid size-11 place-items-center rounded-[14px] border border-white/30 bg-white/15 backdrop-blur-sm">
                    <img src="/images/isotipo-blanco.png" alt="" className="relative z-[1] w-6" />
                </span>
                <span className="text-[19px] font-extrabold tracking-tight text-white">eyplease<span className="text-[#FF8AC6]">+</span></span>
            </div>

            <h1 className="auth-rise mt-9 max-w-[460px] text-[42px] leading-[1.05] font-extrabold tracking-[-.03em] text-white" style={{ '--i': 1 } as React.CSSProperties}>
                Tu negocio, <span className="bg-gradient-to-r from-white to-[#9DF3F5] bg-clip-text text-transparent">al día.</span>
            </h1>
            <p className="auth-rise mt-3.5 max-w-[420px] text-[15.5px] leading-relaxed font-medium text-white/75" style={{ '--i': 2 } as React.CSSProperties}>
                Lo que pasó hoy con tu equipo, tus piezas listas para compartir y un asistente que lo hace contigo.
            </p>

            <Preview />
        </aside>

        <main className="relative z-[1] flex items-center justify-center px-5 py-10">
            <div className="auth-rise auth-card w-full max-w-[420px] rounded-[28px] px-7 py-9 text-center sm:px-9" style={{ '--i': 2 } as React.CSSProperties}>
                <Orb className="mx-auto mb-5 size-[60px]" />
                {children}
            </div>
        </main>

        <p className="absolute bottom-5 left-0 z-[1] w-full text-center text-[11px] font-semibold tracking-wide text-white/45 lg:left-[clamp(40px,6vw,96px)] lg:w-auto lg:text-left">Eyplease+</p>
    </div>
)

export default AuthStage
