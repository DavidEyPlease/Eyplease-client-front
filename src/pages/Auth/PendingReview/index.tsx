import { useMemo } from "react"
import { Clock, MessageCircle, ArrowRight } from "lucide-react"

import SignUpWizardLayout from "@/layouts/SignUpWizardLayout"

const PendingReviewPage = () => {

    const { email, phone } = useMemo(() => {
        const search = new URLSearchParams(window.location.search)
        return {
            email: search.get('email') || '',
            phone: search.get('phone') || '',
        }
    }, [])

    return (
        <SignUpWizardLayout showClose={false}>
            <div className="text-center">
                <span className="shell-grad shell-orb mx-auto grid size-[72px] place-items-center rounded-full">
                    <Clock className="relative size-9 text-white" strokeWidth={2.5} />
                </span>

                <p className="su-accent mt-5 text-[11.5px] font-bold tracking-[.14em] uppercase">
                    Solicitud recibida
                </p>
                <h2 className="mt-2 text-[28px] leading-[1.1] font-extrabold tracking-tight">
                    Gracias por compartir tu caso
                </h2>
                <p className="mx-auto mt-2.5 max-w-[400px] text-[14.5px] leading-relaxed font-medium text-muted-foreground">
                    Eyplease+ está enfocado en Mary Kay, pero{' '}
                    <b className="text-foreground">queremos revisar tu solicitud</b> con calma para ver
                    si podemos ayudarte.
                </p>
            </div>

            <div className="my-7 h-px bg-border" />

            <div className="flex flex-col gap-3">
                <div className="su-soft flex items-start gap-3 rounded-2xl p-4">
                    <span className="su-accent grid size-10 shrink-0 place-items-center rounded-xl bg-card shadow-sm">
                        <MessageCircle className="size-5" />
                    </span>
                    <div className="flex-1 text-left">
                        <p className="text-[14px] font-bold">
                            Te contactamos en menos de 24 horas
                        </p>
                        <p className="mt-0.5 text-[12.5px] text-muted-foreground">
                            Te escribimos por WhatsApp{phone ? ` al número que registraste` : ''} para
                            platicar y activarte la cuenta si encaja con lo que ofrecemos.
                        </p>
                    </div>
                </div>

                {email && (
                    <p className="text-center text-[12.5px] text-muted-foreground">
                        Confirmación enviada a <b className="text-foreground">{email}</b>
                    </p>
                )}
            </div>

            <div className="mt-7 flex justify-center">
                <a
                    href={import.meta.env.VITE_WEB_URL || 'https://eyplease.com.mx'}
                    className="inline-flex h-11 items-center gap-1.5 rounded-full border border-border px-5 text-sm font-bold transition-colors hover:bg-muted dark:border-white/15"
                >
                    Volver a la página de inicio
                    <ArrowRight className="size-4" />
                </a>
            </div>
        </SignUpWizardLayout>
    )
}

export default PendingReviewPage
