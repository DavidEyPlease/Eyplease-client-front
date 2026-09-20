import { cn } from '@/lib/utils'
import './shell.css'

/**
 * El arranque del marco nuevo: lo que se ve entre que se recarga y que responde /me.
 *
 * Es la MISMA silueta que el marco de verdad —fondo con sus luces, barra de vidrio a 62 px, la
 * página a 18 px por debajo y el Asistente a la derecha— con las mismas medidas exactas, para que
 * al llegar los datos nada salte de sitio. Lo que no depende de la persona (el fondo, el logotipo,
 * el orbe) se pinta DE VERDAD; sólo es esqueleto lo que hay que esperar: las pestañas, que dependen
 * de su plan, su nombre y el contenido de la página.
 *
 * No hace una sola petición, a propósito: hasta que la sesión responde, nadie puede adelantarse.
 */

const Bar = ({ className }: { className?: string }) => (
    <span className={cn('boot-bar block rounded-full bg-foreground/[.07] dark:bg-white/[.07]', className)} />
)

const Card = ({ className, children }: { className?: string, children?: React.ReactNode }) => (
    <div className={cn('shell-glass rounded-[20px] p-5', className)}>{children}</div>
)

const BootShell = () => (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#F3F2FA] dark:bg-[#0B0A1A]">
        <div className="shell-backdrop"><i className="shell-blob a" /><i className="shell-blob b" /><i className="shell-blob c" /></div>

        <div className="relative z-[1]">
            {/* Misma barra: 62 px de alto, mismo ancho y mismo radio que `TopBar` */}
            <header className="shell-glass mx-auto mt-3 flex h-[62px] w-[min(1500px,calc(100%-28px))] items-center gap-1.5 rounded-[20px] pr-2.5 pl-3.5">
                <span className="flex items-center gap-2.5 pr-2.5">
                    <span className="shell-grad shell-mark grid size-9 place-items-center rounded-xl shadow-[0_8px_18px_-8px_rgba(108,71,255,.9)]">
                        <img src="/images/isotipo-blanco.png" alt="" className="relative z-[1] w-[21px]" />
                    </span>
                    <span className="hidden text-[15px] leading-none font-extrabold tracking-tight sm:block">
                        eyplease<span className="text-[#E5077D]">+</span>
                    </span>
                </span>

                {/* Las pestañas dependen de su plan: hasta /me no se sabe cuáles son */}
                <nav className="ml-1.5 hidden items-center gap-3.5 md:flex" aria-hidden>
                    {['w-[46px]', 'w-[58px]', 'w-[74px]', 'w-[68px]', 'w-[62px]'].map((width, index) => (
                        <Bar key={index} className={cn('h-[9px]', width)} />
                    ))}
                </nav>

                <div className="ml-auto flex items-center gap-2.5" aria-hidden>
                    <Bar className="size-7 rounded-full" />
                    <Bar className="hidden size-7 rounded-full sm:block" />
                    <Bar className="size-9 rounded-full" />
                    <span className="hidden flex-col gap-1.5 sm:flex">
                        <Bar className="h-[9px] w-[104px]" />
                        <Bar className="h-[7px] w-[62px]" />
                    </span>
                </div>
            </header>

            <div className="mx-auto mt-[18px] mb-16 flex w-[min(1500px,calc(100%-28px))] items-start gap-[18px]">
                <main className="min-w-0 flex-1">
                    {/* Encabezado de página: antetítulo, título y bajada, como los pinta `PageHead` */}
                    <div className="mb-4 flex flex-col gap-2.5" aria-hidden>
                        <Bar className="h-[8px] w-[74px]" />
                        <Bar className="h-[26px] w-[min(420px,72%)]" />
                        <Bar className="h-[10px] w-[min(560px,90%)]" />
                    </div>

                    <div className="flex flex-col gap-4" aria-hidden>
                        <Card className="flex items-center gap-5">
                            <Bar className="size-[92px] shrink-0 rounded-full" />
                            <span className="flex min-w-0 flex-1 flex-col gap-2.5">
                                <Bar className="h-[12px] w-[min(300px,70%)]" />
                                <Bar className="h-[9px] w-[min(420px,92%)]" />
                                <Bar className="h-[9px] w-[min(240px,55%)]" />
                            </span>
                        </Card>

                        <div className="grid gap-4 sm:grid-cols-2">
                            {[0, 1].map(index => (
                                <Card key={index} className="flex flex-col gap-3">
                                    <Bar className="h-[11px] w-[58%]" />
                                    <Bar className="h-[9px] w-[84%]" />
                                    <Bar className="h-[9px] w-[46%]" />
                                </Card>
                            ))}
                        </div>

                        <Card className="h-[220px]" />
                    </div>
                </main>

                {/* El Asistente ocupa su sitio desde el principio: si apareciera después, la página entera se estrecharía de golpe */}
                <aside className="hidden w-[372px] shrink-0 lg:block" aria-hidden>
                    <div className="shell-glass flex h-[calc(100vh-110px)] flex-col gap-4 rounded-3xl p-3.5">
                        <div className="flex items-center gap-3 border-b border-border pb-3">
                            <span className="shell-grad shell-orb grid size-[42px] shrink-0 place-items-center rounded-full">
                                <img src="/images/isotipo-blanco.png" alt="" className="relative w-1/2" />
                            </span>
                            <span className="flex flex-col gap-1.5">
                                <Bar className="h-[10px] w-[96px]" />
                                <Bar className="h-[7px] w-[64px]" />
                            </span>
                        </div>
                        <Bar className="h-[9px] w-[88%]" />
                        <Bar className="h-[9px] w-[64%]" />
                        <Bar className="mt-auto h-[42px] w-full rounded-2xl" />
                    </div>
                </aside>
            </div>
        </div>
    </div>
)

export default BootShell
